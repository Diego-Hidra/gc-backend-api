import sys
import json
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import requests
from io import BytesIO

def generate_embedding(image_url):
    try:
        device = torch.device('cpu') 

        # Cargar modelos
        mtcnn = MTCNN(image_size=160, margin=0, keep_all=False, device=device)
        resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

        # Descargar imagen
        response = requests.get(image_url, stream=True, timeout=10)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))

        # Detectar y procesar
        img_cropped = mtcnn(img)

        if img_cropped is None:
            # Imprimimos JSON de error a stdout
            print(json.dumps({"success": False, "message": "No face detected"}))
            return

        # Generar embedding
        img_embedding = resnet(img_cropped.unsqueeze(0).to(device))
        embedding_list = img_embedding.detach().cpu().numpy()[0].tolist()

        # Imprime JSON para NestJS
        print(json.dumps({
            "success": True,
            "embedding": embedding_list
        }))

    except Exception as e:
        print(json.dumps({"success": False, "message": str(e)}))

if __name__ == "__main__":
    # Leer el argumento pasado desde NestJS
    if len(sys.argv) > 1:
        url_argument = sys.argv[1]
        generate_embedding(url_argument)
    else:
        print(json.dumps({"success": False, "message": "No URL provided"}))