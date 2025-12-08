"""Speech-to-Text API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
import tempfile
import os
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/stt", tags=["stt"])

# Lazy load Whisper model to avoid loading on import
_whisper_model = None


def get_whisper_model():
    """Get or load Whisper model (lazy loading)."""
    global _whisper_model
    if _whisper_model is None:
        try:
            import whisper
            logger.info("loading_whisper_model", model="base")
            _whisper_model = whisper.load_model("base")
            logger.info("whisper_model_loaded")
        except ImportError:
            raise HTTPException(
                status_code=500,
                detail="Whisper not installed. Install with: pip install openai-whisper"
            )
        except Exception as e:
            logger.error("whisper_model_load_failed", error=str(e))
            raise HTTPException(
                status_code=500,
                detail=f"Failed to load Whisper model: {str(e)}"
            )
    return _whisper_model


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(..., description="Audio file to transcribe")
):
    """
    Transcribe audio file to text using Whisper.
    Accepts various audio formats (webm, wav, mp3, etc.).
    """
    try:
        # Get Whisper model
        model = get_whisper_model()
        
        # Save uploaded file to temporary file
        suffix = os.path.splitext(audio.filename)[1] if audio.filename else ".webm"
        if not suffix:
            suffix = ".webm"
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            tmp_path = tmp_file.name
            
            # Read and save audio file
            content = await audio.read()
            tmp_file.write(content)
            tmp_file.flush()
        
        try:
            # Transcribe using Whisper
            logger.info("transcribing_audio", filename=audio.filename, size=len(content))
            result = model.transcribe(tmp_path, fp16=False, language=None)
            text = result.get("text", "").strip()
            
            logger.info("transcription_complete", 
                       text_length=len(text),
                       detected_language=result.get("language"))
            
            return JSONResponse({
                "text": text,
                "language": result.get("language"),
                "segments": result.get("segments", [])
            })
        finally:
            # Clean up temporary file
            try:
                os.remove(tmp_path)
            except OSError:
                pass
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error("transcription_failed", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}"
        )
