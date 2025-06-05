from bs4 import BeautifulSoup
from markdown import markdown


def markdown_to_text(md: str) -> str:
    html = markdown(md)
    soup = BeautifulSoup(html, features="html.parser")
    return soup.get_text()
