import os
import json
import logging
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
import google.generativeai as genai

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load API key
GOOGLE_API_KEY = os.getenv("GOOGLE_AI_API_KEY", "")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    logger.warning("GOOGLE_AI_API_KEY is not set. API calls will return placeholder content.")

app = FastAPI(title="Topical RAG Microservice")

# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_model():
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_AI_API_KEY is not configured")
    return genai.GenerativeModel('gemini-2.0-flash')

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class SearchTopicsRequest(BaseModel):
    query: str
    limit: Optional[int] = None

class GenerateMdxRequest(BaseModel):
    selected_topic: str
    main_topic: str
    topic: Optional[str] = None
    num_results: Optional[int] = None

class UrlMdxRequest(BaseModel):
    url: str
    selected_topic: str
    main_topic: str
    topic: Optional[str] = None
    use_llm_knowledge: Optional[bool] = None

class UrlsMdxRequest(BaseModel):
    urls: List[str]
    selected_topic: str
    main_topic: str
    topic: Optional[str] = None
    use_llm_knowledge: Optional[bool] = None

class RefineRequest(BaseModel):
    mdx: str
    question: str

class RefineWithSelectionRequest(BaseModel):
    mdx: str
    question: str
    selected_text: str
    topic: str
    direct_replacement: Optional[str] = None

class RefineWithCrawlingRequest(BaseModel):
    mdx: str
    question: str
    selected_text: str
    topic: str
    num_results: Optional[int] = None

class RefineWithUrlsRequest(BaseModel):
    mdx: str
    question: str
    selected_text: str
    topic: str
    urls: List[str]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def fetch_url_content(url: str) -> str:
    # A simple best-effort fetching function; replace with crawl4ai logic if needed.
    import requests
    from bs4 import BeautifulSoup
    try:
        response = requests.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            for script in soup(["script", "style"]):
                script.extract()
            text = soup.get_text(separator=' ')
            import re
            text = re.sub(r'\s+', ' ', text).strip()
            return text[:15000]
    except Exception as e:
        logger.error(f"Error fetching URL {url}: {e}")
    return ""

def placeholder_hierarchy(topic: str) -> List[Dict[str, Any]]:
    return [
        {"topic": f"Introduction to {topic}", "subtopics": ["Overview", "Key Concepts", "History"], "relevanceScore": 95},
        {"topic": f"Core Principles of {topic}", "subtopics": ["Fundamental Theory", "Best Practices"], "relevanceScore": 90},
        {"topic": f"Advanced {topic}", "subtopics": ["Advanced Topics", "Case Studies"], "relevanceScore": 80},
        {"topic": f"{topic} in Practice", "subtopics": ["Real-world Examples", "Tools & Ecosystem"], "relevanceScore": 85},
    ]

async def optimize_prompt(raw_topic: str) -> str:
    if not GOOGLE_API_KEY:
        return raw_topic
    try:
        model = get_model()
        prompt = (f"Convert this topic into a precise educational learning objective in 5-10 words. "
                  f"Return ONLY the optimized topic name, nothing else. Topic: \"{raw_topic}\"")
        response = model.generate_content(prompt)
        text = response.text.strip().strip("'\"")
        return text if text else raw_topic
    except Exception as e:
        logger.error(f"Error optimizing prompt: {e}")
        return raw_topic

def placeholder_mdx(topic: str, main_topic: str) -> str:
    return f"""# {topic}

> This is placeholder content. Add your **GOOGLE_AI_API_KEY** to `.env` to enable AI-powered content generation.

## Overview

This section covers **{topic}** as part of the broader **{main_topic}** lesson plan.

## Key Points

- Point one about {topic}
- Point two about {topic}
- Point three about {topic}

## Summary

Add your Google AI API key to unlock automatic MDX generation for this topic.
"""

async def generate_mdx_content(topic: str, main_topic: str, context: str = "") -> str:
    model = get_model()
    context_block = f"\nUse the following reference material to inform your content:\n<context>\n{context}\n</context>\n" if context else ""
    prompt = (f"You are an expert technical writer creating educational MDX content.\n\n"
              f"Generate comprehensive MDX content for the topic: \"{topic}\"\n"
              f"This is part of a lesson plan about: \"{main_topic}\"\n"
              f"{context_block}\n"
              f"Requirements:\n"
              f"- Write in MDX format (Markdown with optional JSX — but keep it simple, no custom components)\n"
              f"- Start with a level-1 heading: # {topic}\n"
              f"- Include 3-5 main sections with ## headings\n"
              f"- Use bullet points, numbered lists, and code blocks where appropriate\n"
              f"- Be educational, clear, and well-structured\n"
              f"- Length: 400-800 words\n"
              f"- Do NOT include frontmatter (no --- blocks)\n"
              f"- Return ONLY the MDX content, nothing else")
    response = model.generate_content(prompt)
    return response.text.strip()

async def refine_mdx_content(full_mdx: str, selected_text: str, question: str, topic: str, context: str = "") -> str:
    model = get_model()
    context_block = f"\nAdditional reference material:\n<context>\n{context}\n</context>\n" if context else ""
    selection_block = f"\nThe user has selected this specific text to refine:\n<selected>\n{selected_text}\n</selected>\n" if selected_text else ""
    
    action = ("Rewrite ONLY the selected text according to the user's request, then return the COMPLETE document with that section replaced. Keep all other content identical." 
              if selected_text else "Refine the entire document according to the user's request.")
    
    prompt = (f"You are an expert technical writer refining educational MDX content.\n\n"
              f"Topic: \"{topic}\"\n"
              f"{selection_block}\n"
              f"User's refinement request: \"{question}\"\n"
              f"{context_block}\n"
              f"Here is the full MDX document:\n<document>\n{full_mdx}\n</document>\n\n"
              f"{action}\n\n"
              f"Return ONLY the complete updated MDX document, nothing else.")
    response = model.generate_content(prompt)
    return response.text.strip()

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.post("/rag/search-topics")
async def search_topics(req: SearchTopicsRequest):
    if not GOOGLE_API_KEY:
        hierarchy = placeholder_hierarchy(req.query)
        return {"status": "success", "data": {"topics": "```json\n" + json.dumps(hierarchy, indent=2) + "\n```"}}
    
    try:
        model = get_model()
        prompt = (f"Generate a structured topic hierarchy for learning about \"{req.query}\".\n\n"
                  f"Return ONLY valid JSON (no markdown, no explanation) in this exact format:\n"
                  f"[\n  {{\n    \"topic\": \"Main topic name\",\n    \"subtopics\": [\"Subtopic 1\", \"Subtopic 2\", \"Subtopic 3\"]\n  }}\n]\n\n"
                  f"Rules:\n- 4-6 main topics\n- 2-4 subtopics each\n- Topics should progress logically from basics to advanced\n"
                  f"- Topic names should be clear and descriptive")
        response = model.generate_content(prompt)
        text = response.text.strip()
        import re
        clean = re.sub(r'^```json\s*', '', text, flags=re.IGNORECASE)
        clean = re.sub(r'\s*```$', '', clean)
        parsed = json.loads(clean)
        
        for i, item in enumerate(parsed):
            if "relevanceScore" not in item:
                item["relevanceScore"] = max(60, 95 - i * 5)
                
        return {"status": "success", "data": {"topics": "```json\n" + json.dumps(parsed, indent=2) + "\n```"}}
    except Exception as e:
        logger.error(f"search-topics error: {e}")
        hierarchy = placeholder_hierarchy(req.query)
        return {"status": "success", "data": {"topics": "```json\n" + json.dumps(hierarchy, indent=2) + "\n```"}}

@app.post("/rag/generate-mdx-llm-only")
async def generate_mdx_llm_only(req: GenerateMdxRequest):
    if not GOOGLE_API_KEY:
        return {"status": "success", "data": {"mdx_content": placeholder_mdx(req.selected_topic, req.main_topic)}}
    try:
        optimized = await optimize_prompt(req.selected_topic)
        mdx = await generate_mdx_content(optimized, req.main_topic)
        return {"status": "success", "data": {"mdx_content": mdx}}
    except Exception as e:
        logger.error(f"generate-mdx-llm-only error: {e}")
        return {"status": "success", "data": {"mdx_content": placeholder_mdx(req.selected_topic, req.main_topic)}}

from fastapi.responses import PlainTextResponse

@app.post("/rag/generate-mdx-llm-only-raw", response_class=PlainTextResponse)
async def generate_mdx_llm_only_raw(req: GenerateMdxRequest):
    if not GOOGLE_API_KEY:
        return placeholder_mdx(req.selected_topic, req.main_topic)
    try:
        optimized = await optimize_prompt(req.selected_topic)
        mdx = await generate_mdx_content(optimized, req.main_topic)
        return mdx
    except Exception as e:
        logger.error(f"generate-mdx-llm-only-raw error: {e}")
        return placeholder_mdx(req.selected_topic, req.main_topic)

@app.post("/rag/single-topic")
async def single_topic(req: GenerateMdxRequest):
    if not GOOGLE_API_KEY:
        return {"status": "success", "data": {"mdx_content": placeholder_mdx(req.selected_topic, req.main_topic)}}
    try:
        mdx = await generate_mdx_content(req.selected_topic, req.main_topic)
        return {"status": "success", "data": {"mdx_content": mdx}}
    except Exception as e:
        logger.error(f"single-topic error: {e}")
        return {"status": "success", "data": {"mdx_content": placeholder_mdx(req.selected_topic, req.main_topic)}}

@app.post("/rag/single-topic-raw", response_class=PlainTextResponse)
async def single_topic_raw(req: GenerateMdxRequest):
    if not GOOGLE_API_KEY:
        return placeholder_mdx(req.selected_topic, req.main_topic)
    try:
        mdx = await generate_mdx_content(req.selected_topic, req.main_topic)
        return mdx
    except Exception as e:
        logger.error(f"single-topic-raw error: {e}")
        return placeholder_mdx(req.selected_topic, req.main_topic)

@app.post("/rag/generate-mdx-from-url")
async def generate_mdx_from_url(req: UrlMdxRequest):
    if not GOOGLE_API_KEY:
        return {"status": "success", "data": {"mdx_content": placeholder_mdx(req.selected_topic, req.main_topic)}}
    try:
        context = await fetch_url_content(req.url)
        mdx = await generate_mdx_content(req.selected_topic, req.main_topic, context)
        return {"status": "success", "data": {"mdx_content": mdx}}
    except Exception as e:
        logger.error(f"generate-mdx-from-url error: {e}")
        return {"status": "success", "data": {"mdx_content": placeholder_mdx(req.selected_topic, req.main_topic)}}

@app.post("/rag/generate-mdx-from-url-raw", response_class=PlainTextResponse)
async def generate_mdx_from_url_raw(req: UrlMdxRequest):
    if not GOOGLE_API_KEY:
        return placeholder_mdx(req.selected_topic, req.main_topic)
    try:
        context = await fetch_url_content(req.url)
        mdx = await generate_mdx_content(req.selected_topic, req.main_topic, context)
        return mdx
    except Exception as e:
        logger.error(f"generate-mdx-from-url-raw error: {e}")
        return placeholder_mdx(req.selected_topic, req.main_topic)

@app.post("/rag/generate-mdx-from-urls")
async def generate_mdx_from_urls(req: UrlsMdxRequest):
    if not GOOGLE_API_KEY:
        return {"status": "success", "data": {"mdx_content": placeholder_mdx(req.selected_topic, req.main_topic)}}
    try:
        contents = await asyncio.gather(*(fetch_url_content(url) for url in req.urls))
        context = "\n\n---\n\n".join(filter(None, contents))[:20000]
        mdx = await generate_mdx_content(req.selected_topic, req.main_topic, context)
        return {"status": "success", "data": {"mdx_content": mdx}}
    except Exception as e:
        logger.error(f"generate-mdx-from-urls error: {e}")
        return {"status": "success", "data": {"mdx_content": placeholder_mdx(req.selected_topic, req.main_topic)}}

@app.post("/rag/generate-mdx-from-urls-raw", response_class=PlainTextResponse)
async def generate_mdx_from_urls_raw(req: UrlsMdxRequest):
    if not GOOGLE_API_KEY:
        return placeholder_mdx(req.selected_topic, req.main_topic)
    try:
        contents = await asyncio.gather(*(fetch_url_content(url) for url in req.urls))
        context = "\n\n---\n\n".join(filter(None, contents))[:20000]
        mdx = await generate_mdx_content(req.selected_topic, req.main_topic, context)
        return mdx
    except Exception as e:
        logger.error(f"generate-mdx-from-urls-raw error: {e}")
        return placeholder_mdx(req.selected_topic, req.main_topic)

@app.post("/rag/refine")
async def refine(req: RefineRequest):
    if not GOOGLE_API_KEY:
        return {"status": "success", "data": {"mdx_content": req.mdx}}
    try:
        refined = await refine_mdx_content(req.mdx, "", req.question, "")
        return {"status": "success", "data": {"mdx_content": refined}}
    except Exception as e:
        logger.error(f"refine error: {e}")
        return {"status": "success", "data": {"mdx_content": req.mdx}}

@app.post("/rag/refine-with-selection")
async def refine_with_selection(req: RefineWithSelectionRequest):
    if not GOOGLE_API_KEY:
        return {"status": "success", "data": {"mdx_content": req.mdx}}
    try:
        refined = await refine_mdx_content(req.mdx, req.selected_text, req.question, req.topic)
        return {"status": "success", "data": {"mdx_content": refined}}
    except Exception as e:
        return {"status": "success", "data": {"mdx_content": req.mdx}}

@app.post("/rag/refine-with-selection-raw", response_class=PlainTextResponse)
async def refine_with_selection_raw(req: RefineWithSelectionRequest):
    if not GOOGLE_API_KEY:
        return req.mdx
    try:
        refined = await refine_mdx_content(req.mdx, req.selected_text, req.question, req.topic)
        return refined
    except Exception as e:
        return req.mdx

@app.post("/rag/refine-with-crawling")
async def refine_with_crawling(req: RefineWithCrawlingRequest):
    if not GOOGLE_API_KEY:
        return {"status": "success", "data": {"mdx_content": req.mdx}}
    try:
        refined = await refine_mdx_content(req.mdx, req.selected_text, req.question, req.topic)
        return {"status": "success", "data": {"mdx_content": refined}}
    except Exception as e:
        return {"status": "success", "data": {"mdx_content": req.mdx}}

@app.post("/rag/refine-with-crawling-raw", response_class=PlainTextResponse)
async def refine_with_crawling_raw(req: RefineWithCrawlingRequest):
    if not GOOGLE_API_KEY:
        return req.mdx
    try:
        refined = await refine_mdx_content(req.mdx, req.selected_text, req.question, req.topic)
        return refined
    except Exception as e:
        return req.mdx

@app.post("/rag/refine-with-urls")
async def refine_with_urls(req: RefineWithUrlsRequest):
    if not GOOGLE_API_KEY:
        return {"status": "success", "data": {"mdx_content": req.mdx}}
    try:
        contents = await asyncio.gather(*(fetch_url_content(url) for url in req.urls))
        context = "\n\n---\n\n".join(filter(None, contents))[:15000]
        refined = await refine_mdx_content(req.mdx, req.selected_text, req.question, req.topic, context)
        return {"status": "success", "data": {"mdx_content": refined}}
    except Exception as e:
        return {"status": "success", "data": {"mdx_content": req.mdx}}

@app.post("/rag/refine-with-urls-raw", response_class=PlainTextResponse)
async def refine_with_urls_raw(req: RefineWithUrlsRequest):
    if not GOOGLE_API_KEY:
        return req.mdx
    try:
        contents = await asyncio.gather(*(fetch_url_content(url) for url in req.urls))
        context = "\n\n---\n\n".join(filter(None, contents))[:15000]
        refined = await refine_mdx_content(req.mdx, req.selected_text, req.question, req.topic, context)
        return refined
    except Exception as e:
        return req.mdx
