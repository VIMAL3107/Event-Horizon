import httpx
from duckduckgo_search import DDGS
from bs4 import BeautifulSoup

def search_web(query: str):
    """
    Searches the web using DuckDuckGo and returns the top results.
    Use this tool when the user asks a question that requires current or external knowledge.
    """
    try:
        results = DDGS().text(query, max_results=5)
        if not results:
            return "No results found."
        
        # Format results as a string
        formatted_results = ""
        for result in results:
            formatted_results += f"Title: {result['title']}\nURL: {result['href']}\nSummary: {result['body']}\n\n"
        return formatted_results
    except Exception as e:
        return f"Error searching web: {str(e)}"

def read_website(url: str):
    """
    Reads the text content of a website.
    Use this tool when the user provides a URL and asks to summarize or explain it.
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = httpx.get(url, headers=headers, follow_redirects=True, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.extract()
            
        # Get text
        text = soup.get_text()
        
        # Break into lines and remove leading/trailing space on each
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Limit text length to avoid context overflow (approx 4000 chars)
        return text[:4000] + "..." if len(text) > 4000 else text
    except Exception as e:
        return f"Error reading website: {str(e)}"

import webbrowser

def open_browser(url: str):
    """
    Opens a URL in the user's default web browser.
    Use this tool when the user explicitly asks to "open" a link or site on their computer.
    """
    try:
        webbrowser.open(url)
        return f"Opened {url} in browser."
    except Exception as e:
        return f"Error opening browser: {str(e)}"
