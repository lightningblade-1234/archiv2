"""Journal API endpoints for generating AI suggestions."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.db.database import get_db
from app.core.llm_client import get_llm_client
import structlog
import html

logger = structlog.get_logger()
router = APIRouter(prefix="/api/journal", tags=["journal"])


class JournalEntry(BaseModel):
    id: str
    date: str
    title: str
    content: str
    preview: str
    timestamp: int


class JournalSuggestionsRequest(BaseModel):
    student_id: str
    entries: List[JournalEntry]


class JournalSuggestionsResponse(BaseModel):
    suggestion: str


def strip_html(html_content: str) -> str:
    """Strip HTML tags from journal entry content."""
    if not html_content:
        return ""
    # Remove HTML tags
    text = html.unescape(html_content)
    # Simple HTML tag removal
    import re
    text = re.sub(r'<[^>]+>', '', text)
    return text.strip()


@router.post("/suggestions", response_model=JournalSuggestionsResponse)
async def generate_journal_suggestions(
    request: JournalSuggestionsRequest,
    db: Session = Depends(get_db),
    llm_client = Depends(get_llm_client)
):
    """Generate daily suggestions based on journal entries using LLM."""
    try:
        if not request.entries:
            return JournalSuggestionsResponse(
                suggestion="Start writing in your journal to receive personalized suggestions!"
            )
        
        # Prepare journal entries for LLM analysis
        # Get the most recent entries (last 10 entries)
        recent_entries = sorted(request.entries, key=lambda x: x.timestamp, reverse=True)[:10]
        
        # Build context from journal entries
        entries_text = []
        for entry in recent_entries:
            # Strip HTML and get plain text
            plain_content = strip_html(entry.content)
            if plain_content:
                entries_text.append(f"Date: {entry.date}\nContent: {plain_content[:500]}")  # Limit to 500 chars per entry
        
        journal_context = "\n\n---\n\n".join(entries_text)
        
        # Create LLM prompt for generating suggestions
        user_prompt = f"""Based on the following journal entries from a student, provide a thoughtful, personalized suggestion for today. 

The suggestion should:
1. Be encouraging and supportive
2. Be specific to patterns or themes you notice in their entries
3. Be actionable and practical
4. Focus on personal growth, self-care, or reflection
5. Be concise (2-3 sentences maximum)

Journal Entries:
{journal_context}

Provide a single, personalized suggestion for today based on these entries. Be warm, empathetic, and specific to what you've observed in their writing."""

        # Generate suggestion using LLM
        suggestion = await llm_client.generate(
            prompt=user_prompt,
            max_tokens=200,
            system_message="You are a supportive mental health assistant helping students reflect on their journal entries. Provide thoughtful, personalized suggestions that encourage growth and self-awareness."
        )
        
        # Clean up the suggestion (remove any markdown formatting if present)
        suggestion = suggestion.strip()
        if suggestion.startswith('"') and suggestion.endswith('"'):
            suggestion = suggestion[1:-1]
        
        return JournalSuggestionsResponse(suggestion=suggestion)
        
    except Exception as e:
        logger.error("failed_to_generate_journal_suggestions", 
                    student_id=request.student_id,
                    error=str(e),
                    exc_info=True)
        # Return a fallback suggestion
        return JournalSuggestionsResponse(
            suggestion="Take a moment today to reflect on what you're grateful for. Consider writing about something positive that happened recently."
        )

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.db.database import get_db
from app.core.llm_client import get_llm_client
import structlog
import html

logger = structlog.get_logger()
router = APIRouter(prefix="/api/journal", tags=["journal"])


class JournalEntry(BaseModel):
    id: str
    date: str
    title: str
    content: str
    preview: str
    timestamp: int


class JournalSuggestionsRequest(BaseModel):
    student_id: str
    entries: List[JournalEntry]


class JournalSuggestionsResponse(BaseModel):
    suggestion: str


def strip_html(html_content: str) -> str:
    """Strip HTML tags from journal entry content."""
    if not html_content:
        return ""
    # Remove HTML tags
    text = html.unescape(html_content)
    # Simple HTML tag removal
    import re
    text = re.sub(r'<[^>]+>', '', text)
    return text.strip()


@router.post("/suggestions", response_model=JournalSuggestionsResponse)
async def generate_journal_suggestions(
    request: JournalSuggestionsRequest,
    db: Session = Depends(get_db),
    llm_client = Depends(get_llm_client)
):
    """Generate daily suggestions based on journal entries using LLM."""
    try:
        if not request.entries:
            return JournalSuggestionsResponse(
                suggestion="Start writing in your journal to receive personalized suggestions!"
            )
        
        # Prepare journal entries for LLM analysis
        # Get the most recent entries (last 10 entries)
        recent_entries = sorted(request.entries, key=lambda x: x.timestamp, reverse=True)[:10]
        
        # Build context from journal entries
        entries_text = []
        for entry in recent_entries:
            # Strip HTML and get plain text
            plain_content = strip_html(entry.content)
            if plain_content:
                entries_text.append(f"Date: {entry.date}\nContent: {plain_content[:500]}")  # Limit to 500 chars per entry
        
        journal_context = "\n\n---\n\n".join(entries_text)
        
        # Create LLM prompt for generating suggestions
        user_prompt = f"""Based on the following journal entries from a student, provide a thoughtful, personalized suggestion for today. 

The suggestion should:
1. Be encouraging and supportive
2. Be specific to patterns or themes you notice in their entries
3. Be actionable and practical
4. Focus on personal growth, self-care, or reflection
5. Be concise (2-3 sentences maximum)

Journal Entries:
{journal_context}

Provide a single, personalized suggestion for today based on these entries. Be warm, empathetic, and specific to what you've observed in their writing."""

        # Generate suggestion using LLM
        suggestion = await llm_client.generate(
            prompt=user_prompt,
            max_tokens=200,
            system_message="You are a supportive mental health assistant helping students reflect on their journal entries. Provide thoughtful, personalized suggestions that encourage growth and self-awareness."
        )
        
        # Clean up the suggestion (remove any markdown formatting if present)
        suggestion = suggestion.strip()
        if suggestion.startswith('"') and suggestion.endswith('"'):
            suggestion = suggestion[1:-1]
        
        return JournalSuggestionsResponse(suggestion=suggestion)
        
    except Exception as e:
        logger.error("failed_to_generate_journal_suggestions", 
                    student_id=request.student_id,
                    error=str(e),
                    exc_info=True)
        # Return a fallback suggestion
        return JournalSuggestionsResponse(
            suggestion="Take a moment today to reflect on what you're grateful for. Consider writing about something positive that happened recently."
        )


