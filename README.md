# SystemNegocjacjiProjekt

##  Uruchomienie projektu

### 1. Wymagania
Upewnij się, że masz zainstalowane:
- **Python 3.10+**
- **pip**
- **Node.js** oraz **npm**

### 2. Instalacja i uruchomienie

```bash
# Instalacja zależności backendu
pip install -r requirements.txt

# Uruchomienie backendu
cd api/
uvicorn main:app --reload --port 8000

# Instalacja zależności frontendu
cd ../app/
npm install

# Uruchomienie frontendu
npm run dev