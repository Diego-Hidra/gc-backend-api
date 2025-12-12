import { Injectable, BadRequestException } from '@nestjs/common';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

@Injectable()
export class AzureBlobService {
  private containerClient: ContainerClient;
  private readonly containerName = 'profile-images';

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    
    if (!connectionString) {
      console.warn('⚠️ AZURE_STORAGE_CONNECTION_STRING no configurado');
      return;
    }

    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.containerClient = blobServiceClient.getContainerClient(this.containerName);
      
      // Crear el contenedor si no existe
      this.initializeContainer();
      console.log('✅ Azure Blob Storage inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Azure Blob Storage:', error);
    }
  }

  /**
   * Inicializa el contenedor si no existe
   */
  private async initializeContainer(): Promise<void> {
    try {
      await this.containerClient.createIfNotExists({
        access: 'blob', // Acceso público para leer las imágenes
      });
      console.log(`📦 Contenedor '${this.containerName}' listo`);
    } catch (error) {
      console.error('Error creando contenedor:', error);
    }
  }

  /**
   * Sube una imagen en base64 a Azure Blob Storage
   * @param base64Image Imagen en formato base64 (con o sin prefijo data:image)
   * @param fileName Nombre del archivo (sin extensión)
   * @returns URL pública de la imagen
   */
  async uploadImage(base64Image: string, fileName: string): Promise<string> {
    if (!this.containerClient) {
      throw new BadRequestException('Azure Blob Storage no está configurado');
    }

    try {
      // Extraer el tipo de imagen y los datos del base64
      let imageBuffer: Buffer;
      let extension = 'jpg';
      let contentType = 'image/jpeg';

      if (base64Image.includes('data:image')) {
        // Formato: data:image/png;base64,iVBORw0KGgo...
        const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          contentType = `image/${matches[1]}`;
          imageBuffer = Buffer.from(matches[2], 'base64');
        } else {
          throw new BadRequestException('Formato de imagen base64 inválido');
        }
      } else {
        // Solo datos base64 sin prefijo
        imageBuffer = Buffer.from(base64Image, 'base64');
      }

      // Generar nombre único con timestamp
      const uniqueFileName = `${fileName}-${Date.now()}.${extension}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(uniqueFileName);

      // Subir la imagen
      await blockBlobClient.uploadData(imageBuffer, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
      });

      console.log(`✅ Imagen subida: ${uniqueFileName}`);
      return blockBlobClient.url;
    } catch (error) {
      console.error('❌ Error subiendo imagen a Azure:', error);
      throw new BadRequestException('Error al subir la imagen');
    }
  }

  /**
   * Elimina una imagen de Azure Blob Storage
   * @param imageUrl URL de la imagen a eliminar
   */
  async deleteImage(imageUrl: string): Promise<void> {
    if (!this.containerClient) {
      return;
    }

    try {
      // Extraer el nombre del blob de la URL
      const url = new URL(imageUrl);
      const blobName = url.pathname.split('/').pop();
      
      if (blobName) {
        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
        console.log(`🗑️ Imagen eliminada: ${blobName}`);
      }
    } catch (error) {
      console.error('Error eliminando imagen:', error);
    }
  }
}
