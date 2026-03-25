from fastapi import FastAPI
from datetime import datetime
app = FastAPI()
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
servicios_db = [
    {"nombre": "consulta", "precio": 50},
    {"nombre": "baño", "precio": 60},
    {"nombre": "corte", "precio": 100}
]
@app.get("/servicios")
def listar_servicios():
    return {
        "servicios": servicios_db
    }
@app.post("/agregar-servicio")
def agregar_servicio(nuevo: dict):
    servicios_db.append(nuevo)
    return {
        "mensaje": "¡Servicio guardado!"
    }
