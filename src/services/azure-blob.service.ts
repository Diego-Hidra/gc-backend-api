import { Injectable, BadRequestException } from '@nestjs/common';
import { BlobServiceClient, StorageSharedKeyCredential, ContainerClient } from '@azure/storage-blob';

@Injectable()
export class AzureBlobService {
  private containerClient: ContainerClient;
  private readonly containerName = 'profile-images';

  constructor() {
    const accountName = process.env.ACCOUNT_NAME;
    const accountKey = process.env.ACCOUNT_KEY;
    
    if (!accountName || !accountKey) {
      console.warn('⚠️ ACCOUNT_NAME o ACCOUNT_KEY no configurados');
      return;
    }

    try {
      const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
      const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        sharedKeyCredential
      );
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
   * @param base64Image Imagen en formato base64 con prefijo data:image/...;base64,...
   * @param fileName Nombre del archivo (sin extensión)
   * @returns URL pública de la imagen
   */
  async uploadImage(base64Image: string, fileName: string): Promise<string> {
    if (!this.containerClient) {
      throw new BadRequestException('Azure Blob Storage no está configurado');
    }

    try {
      // Regex para extraer MIME type y datos base64
      const mimeTypeRegex = /^data:(image\/[a-z]+);base64,/;
      const matches = base64Image.match(mimeTypeRegex);
      
      if (!matches) {
        throw new BadRequestException(
          'Formato de imagen base64 inválido. Use: data:image/[tipo];base64,[datos]'
        );
      }

      const mimeType = matches[1];
      const base64Data = base64Image.replace(mimeTypeRegex, '');
      const extension = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];

      // Convertir base64 a Buffer (datos binarios)
      let imageBuffer: Buffer;
      try {
        imageBuffer = Buffer.from(base64Data, 'base64');
      } catch (error) {
        throw new BadRequestException('Error al decodificar la imagen Base64');
      }

      // Generar nombre único con timestamp y extensión
      const uniqueFileName = `${fileName}-${Date.now()}.${extension}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(uniqueFileName);

      // Subir la imagen con headers HTTP
      await blockBlobClient.uploadData(imageBuffer, {
        blobHTTPHeaders: {
          blobContentType: mimeType,
        },
      });

      console.log(`✅ Imagen subida exitosamente: ${uniqueFileName}`);
      return blockBlobClient.url;
    } catch (error) {
      console.error('❌ Error subiendo imagen a Azure:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al subir la imagen a Azure Storage');
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
