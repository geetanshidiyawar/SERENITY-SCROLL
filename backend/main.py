from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(
    title="Serenity API",
    description="Backend for the Serenity digital wellbeing extension"
)


class PageData(BaseModel):

    url: str

    title: str

    text: str

    time_spent_seconds: int


@app.get("/")
def root():

    return {
        "status": "Serenity API is running"
    }


@app.post("/page-data")
def receive_page_data(data: PageData):

    print("\n==============================")
    print("SERENITY RECEIVED PAGE DATA")
    print("==============================")

    print("URL:")
    print(data.url)

    print("\nTITLE:")
    print(data.title)

    print("\nTIME SPENT:")
    print(data.time_spent_seconds, "seconds")

    print("\nTEXT:")
    print(data.text[:500])

    print("==============================\n")


    return {

        "success": True,

        "message": "Page data received successfully",

        "url": data.url,

        "title": data.title,

        "time_spent_seconds":
            data.time_spent_seconds

    }