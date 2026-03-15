
import requests
from bs4 import BeautifulSoup

url = "https://www.assistir.biz/series-todas"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"}

try:
    response = requests.get(url, headers=headers, timeout=20.0)
    
    if response.status_code != 200:
        print(f"Status error: {response.status_code}")
        exit()
        
    soup = BeautifulSoup(response.text, 'html.parser')
    cards = soup.find_all('div', class_='card')
    
    print(f"Total cards: {len(cards)}")
    
    for i, card in enumerate(cards[:30]):
        title_tag = card.find('h3', class_='card__title')
        name = title_tag.get_text().strip() if title_tag else "No Title"
        
        tags_div = card.find('div', class_='tags-top')
        tag_text = tags_div.get_text().strip() if tags_div else "No Tag"
        
        print(f"{i}. {name} | Tag: {tag_text}")
        if tags_div:
            print(f"   HTML: {tags_div}")

except Exception as e:
    print(f"Error: {e}")
