# Predictive Maintenance System

A comprehensive predictive maintenance system that uses machine learning to predict equipment failures and provides an AI-powered maintenance assistant to help engineers make informed decisions.

## 🌟 Features

- **Real-time Machine Monitoring** - Track sensor data from multiple machines
- **Predictive Analytics** - ML-based failure prediction using XGBoost
- **AI Maintenance Assistant** - Chat with Gemini AI for maintenance insights
- **Risk Assessment** - Automatic risk scoring and failure type classification
- **Maintenance Recommendations** - Prioritized action items based on predictions
- **RESTful API** - Complete API with Swagger documentation
- **Authentication** - JWT-based user authentication

## 🏗️ Architecture

The system consists of two main components:

1. **Hapi.js Backend** (Node.js)
   - REST API endpoints
   - Database management (PostgreSQL)
   - User authentication
   - AI agent service (Google Gemini)

2. **FastAPI ML Service** (Python)
   - Machine learning inference
   - Predictive models (XGBoost)
   - Feature engineering
   - SHAP explanations

## 📋 Prerequisites

- Node.js (v18 or higher)
- Python 3.8+
- PostgreSQL
- Google Gemini API Key (optional, for AI assistant)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/dash4k/hapi-capstone.git
cd hapi-capstone/
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE predictive_maintenance;
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Settings
HOST=localhost
PORT=5000

# PostgreSQL Settings
PGUSER=your_username
PGHOST=localhost
PGPASSWORD=your_password
PGDATABASE=predictive_maintenance
PGPORT=5432

# FastAPI Settings
FASTAPIPROTOCOL=http
FASTAPIHOST=localhost
FASTAPIPORT=8001

# JWT Authentication
ACCESS_TOKEN_KEY=your-secret-access-token-key
ACCESS_TOKEN_AGE=1800
REFRESH_TOKEN_KEY=your-secret-refresh-token-key

# Google Gemini AI (Optional)
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Install Dependencies

#### Backend (Node.js)

```bash
npm install
```

#### ML Service (Python)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 5. Database Migration

Run database migrations to create tables:

```bash
npm run migrate up
```

### 6. Start the Services

#### Start Backend Server

```bash
npm start
```

The backend will start at `http://localhost:5000`

#### Start FastAPI ML Service (in a separate terminal)

```bash
# Activate virtual environment first
python fastapi_main.py
```

The ML service will start at `http://localhost:8001`

## 📚 API Documentation

Once the backend is running, access the Swagger documentation at:

```
http://localhost:5000/documentation
```

## 🔑 API Endpoints

### Authentication

- `POST /users` - Register new user
- `POST /authentications` - Login
- `PUT /authentications` - Refresh access token
- `DELETE /authentications` - Logout

### Machines

- `POST /machines` - Add new machine
- `GET /machines` - List all machines
- `GET /machines/{id}` - Get machine details

### Sensors

- `POST /sensors` - Record sensor data
- `GET /sensors/{machineId}/latest` - Get latest sensor reading
- `GET /sensors/{machineId}/history` - Get sensor history

### Diagnostics

- `POST /diagnostics/{machineId}` - Run predictive analysis
- `GET /diagnostics/{machineId}` - Get diagnostic history
- `GET /diagnostics` - Get latest diagnostics for all machines

### AI Agent

- `POST /api/agent/chat` - Chat with AI assistant
- `DELETE /api/agent/session/{sessionId}` - Clear chat session
- `GET /api/agent/recommendations` - Get maintenance recommendations
- `GET /api/agent/overview` - Get system overview

## 📊 Machine Learning Models

The system uses pre-trained models located in the `models/` directory:

- `binary_failure_model.joblib` - Binary failure classifier
- `multiclass_failure_model.joblib` - Failure type classifier
- `type_encoder.joblib` - Machine type encoder
- `model_metadata.json` - Model configuration

### Failure Types

- **TWF** - Tool Wear Failure
- **HDF** - Heat Dissipation Failure
- **PWF** - Power Failure
- **OSF** - Overstrain Failure
- **RNF** - Random Failure

## 🤖 Using the AI Assistant

The AI assistant powered by Google Gemini can help with:

1. Identifying high-risk machines
2. Prioritizing maintenance tasks
3. Explaining failure predictions
4. Providing actionable recommendations

Example queries:
- "Which machines need attention?"
- "What's the status of machine-001?"
- "Give me a system overview"
- "What maintenance should we prioritize?"

## 💡 Usage Example

### 1. Register a User

```bash
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "engineer1",
    "password": "secure123",
    "fullname": "John Engineer"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/authentications \
  -H "Content-Type: application/json" \
  -d '{
    "username": "engineer1",
    "password": "secure123"
  }'
```

### 3. Add a Machine

```bash
curl -X POST http://localhost:5000/machines \
  -H "Content-Type: application/json" \
  -d '{
    "id": "machine-001",
    "type": "M",
    "location": "Factory Floor A"
  }'
```

### 4. Record Sensor Data

```bash
curl -X POST http://localhost:5000/sensors \
  -H "Content-Type: application/json" \
  -d '{
    "machineId": "machine-001",
    "airTemp": 298.1,
    "processTemp": 308.6,
    "rotationalSpeed": 1551,
    "torque": 42.8,
    "toolWear": 0
  }'
```

### 5. Run Diagnostics

```bash
curl -X POST http://localhost:5000/diagnostics/machine-001
```

### 6. Chat with AI Assistant

```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Which machines need attention?"
  }'
```

## 🗂️ Project Structure

```
├── src/
│   ├── api/              # API route handlers
│   │   ├── agent/        # AI assistant endpoints
│   │   ├── authentications/
│   │   ├── diagnostics/
│   │   ├── machines/
│   │   ├── sensors/
│   │   └── users/
│   ├── services/         # Business logic
│   │   ├── agent/        # AI agent service
│   │   └── postgres/     # Database services
│   ├── validator/        # Input validation
│   ├── exceptions/       # Custom error classes
│   └── server.js         # Main server file
├── models/               # ML models
├── migrations/           # Database migrations
├── fastapi_main.py       # ML inference service
├── requirements.txt      # Python dependencies
└── package.json          # Node.js dependencies
```

## 🛠️ Development

### Running Migrations

```bash
# Create new migration
npm run migrate create migration-name

# Run migrations
npm run migrate up

# Rollback migrations
npm run migrate down
```

### Code Style

The project uses ESLint with Google style guide:

```bash
npx eslint . --fix
```

## 🔧 Troubleshooting

### FastAPI Connection Error

If diagnostics fail with connection error:
- Ensure FastAPI service is running on the correct port
- Check `FASTAPIHOST` and `FASTAPIPORT` in `.env`

### Database Connection Error

- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### AI Assistant Not Working

- Verify `GEMINI_API_KEY` is set in `.env`
- Check API key is valid
- System will fall back to rule-based responses if Gemini is unavailable

## 📝 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Note**: Make sure to keep your API keys and database credentials secure. Never commit the `.env` file to version control.