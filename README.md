# RecipesByIQ

**Smart Nigerian recipe suggestions powered by AI**

RecipesByIQ is a REST API that takes the ingredients you already have at home and uses a large language model to suggest recipes you can make right now. It prioritises Nigerian cuisine by default, ranks results by how many of the required ingredients you already own, and splits suggestions into three tiers — recipes you can cook immediately, recipes where you're only missing one or two things, and recipes that need a full shopping trip. Every request is persisted to MySQL so you can review your suggestion history and track which ingredients you reach for most.

---

## Tech Stack

- **FastAPI** — async Python web framework
- **Groq** — free LLM inference API (llama-3.3-70b-versatile)
- **SQLAlchemy** — ORM for MySQL
- **PyMySQL + cryptography** — MySQL driver for Python
- **Pydantic / pydantic-settings** — request validation and settings management
- **pytest** — test suite (runs on SQLite, no MySQL required)

---

## Prerequisites

- Python 3.11 or higher
- MySQL installed and running locally

---

## MySQL Setup

Open a MySQL shell (`mysql -u root -p`) and run:

```sql
CREATE DATABASE recipesbyiq_db;
CREATE USER 'recipesbyiq_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON recipesbyiq_db.* TO 'recipesbyiq_user'@'localhost';
FLUSH PRIVILEGES;
```

SQLAlchemy creates all tables automatically on first run — no migrations needed.

---

## Setup

**1. Clone the repo**

```bash
git clone https://github.com/yourusername/recipesbyiq.git
cd recipesbyiq
```

**2. Create and activate a virtual environment**

```bash
python3 -m venv venv
source venv/bin/activate       # macOS / Linux
venv\Scripts\activate          # Windows
```

**3. Install dependencies**

```bash
pip install -r requirements.txt
```

**4. Configure environment variables**

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
DATABASE_URL=mysql+pymysql://recipesbyiq_user:yourpassword@localhost:3306/recipesbyiq_db
MAX_INGREDIENTS=20
```

---

## Get a Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up — takes about 2 minutes, no credit card required
3. Click **API Keys** → **Create API Key**
4. Copy the key into your `.env` file

Groq's free tier is generous enough to run this project without paying anything.

---

## Run the API

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs (Swagger UI) are at `http://localhost:8000/docs`.

---

## API Endpoints

### Health check

```bash
curl http://localhost:8000/api/v1/health
```

```json
{"status": "ok", "llm": "connected", "database": "connected"}
```

---

### Suggest recipes from ingredients

```bash
curl -X POST http://localhost:8000/api/v1/recipes/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": ["eggs", "tomatoes", "onions", "rice", "palm oil", "scotch bonnet"],
    "cuisine_preference": "nigerian",
    "max_prep_time_minutes": 45
  }'
```

```json
{
  "request_id": "e3b0c442-98fc-1c14-9afb-f4c8996fb924",
  "ingredients_provided": ["eggs", "tomatoes", "onions", "rice", "palm oil", "scotch bonnet"],
  "total_recipes_found": 5,
  "can_make_now": [...],
  "almost_there": [...],
  "needs_shopping": [...]
}
```

---

### View suggestion history

```bash
curl "http://localhost:8000/api/v1/recipes/history?limit=5"
```

---

### Save a recipe

```bash
curl -X POST http://localhost:8000/api/v1/recipes/save \
  -H "Content-Type: application/json" \
  -d '{
    "recipe_name": "Egg Sauce with Rice",
    "recipe_data": {
      "prep_time_minutes": 25,
      "difficulty": "easy",
      "instructions": ["Cook rice", "Make egg sauce", "Serve"]
    }
  }'
```

---

### View saved recipes

```bash
curl http://localhost:8000/api/v1/recipes/saved
```

---

### Delete a saved recipe

```bash
curl -X DELETE http://localhost:8000/api/v1/recipes/saved/1
```

```json
{"message": "Recipe deleted successfully"}
```

---

### Most popular ingredients

```bash
curl http://localhost:8000/api/v1/ingredients/popular
```

```json
[
  {"ingredient": "onions", "count": 42},
  {"ingredient": "tomatoes", "count": 38}
]
```

---

## Run Tests

The test suite uses an in-memory SQLite database and mocks all Groq API calls — no real API key or MySQL instance needed.

```bash
pytest tests/ -v
```

---

## Deployment (Both Free)

### MySQL — PlanetScale

1. Create a free account at [planetscale.com](https://planetscale.com)
2. Create a new database called `recipesbyiq_db`
3. Go to **Connect** → select **Python / SQLAlchemy** → copy the connection string
4. Update `DATABASE_URL` in your production environment:

```
DATABASE_URL=mysql+pymysql://username:password@host.psdb.cloud/recipesbyiq_db?ssl_ca=/etc/ssl/cert.pem
```

### App hosting — Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create a new **Web Service**
3. Connect your GitHub repo
4. Set the build command: `pip install -r requirements.txt`
5. Set the start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add your environment variables (`GROQ_API_KEY`, `DATABASE_URL`, etc.) under **Environment**
7. Deploy — Render's free tier is enough to run this project

---

## Example

Tested with `eggs, tomatoes, onions, rice, palm oil, scotch bonnet`:

| Recipe | Match | Missing |
|---|---|---|
| Egg Sauce with Rice | 100% | nothing — cook now |
| Fried Egg and Tomato Stew | 100% | nothing — cook now |
| Jollof Rice | 70% | tomato paste, stock |
| Tomato Fried Rice | 65% | mixed vegetables |
| Egusi Soup | 30% | egusi, crayfish, stockfish, beef, ugu |

The API returns these pre-sorted into `can_make_now`, `almost_there`, and `needs_shopping` so your frontend never has to think about the ranking logic.
