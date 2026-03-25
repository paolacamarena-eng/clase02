from fastapi import FastAPI
from datetime import datetime
from routes.servicios import router as servicios_router
from routes.auth import router as auth_router

app = FastAPI()

# Incluir los routers
app.include_router(servicios_router)
app.include_router(auth_router)


@app.get("/")
def saludar():
    return {"mensaje": "¡Hola! Bienvenido a mi API"}


@app.get("/bienvenido/{nombre}")
def saludar_persona(nombre: str):
    return {"mensaje": f"Hola {nombre}, ¡qué bueno verte por aquí!"}


@app.get("/fecha")
def dame_la_hora():
    ahora = datetime.now()
    return {
        "fecha": ahora.strftime("%Y-%m-%d"),
        "hora": ahora.strftime("%H:%M:%S"),
        "iso": ahora.isoformat()
    }
