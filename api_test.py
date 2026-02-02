import requests

response = requests.get('https://optcgapi.com/api/sets/card/OP01-001/')
response_text = response.json()
print(response_text)
