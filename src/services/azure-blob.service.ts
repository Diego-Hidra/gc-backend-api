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
      console.log('🔵 [Azure] Iniciando uploadImage con fileName:', fileName);
      
      // Regex para extraer MIME type y datos base64
      const mimeTypeRegex = /^data:(image\/[a-z]+);base64,/;
      const matches = base64Image.match(mimeTypeRegex);
      
      console.log('🔵 [Azure] Validando formato base64...');
      console.log('🔵 [Azure] Imagen base64 inicio:', base64Image?.substring(0, 50) || 'null');
      
      if (!matches) {
        console.error('❌ [Azure] Formato base64 inválido');
        throw new BadRequestException(
          'Formato de imagen base64 inválido. Use: data:image/[tipo];base64,[datos]'
        );
      }

      const mimeType = matches[1];
      const base64Data = base64Image.replace(mimeTypeRegex, '');
      const extension = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];

      console.log('🔵 [Azure] MIME Type extraído:', mimeType);
      console.log('🔵 [Azure] Extension:', extension);
      console.log('🔵 [Azure] Base64 data length:', base64Data.length);

      // Convertir base64 a Buffer (datos binarios)
      let imageBuffer: Buffer;
      try {
        console.log('🔵 [Azure] Convirtiendo base64 a Buffer...');
        imageBuffer = Buffer.from(base64Data, 'base64');
        console.log('🔵 [Azure] Buffer creado. Size:', imageBuffer.length, 'bytes');
      } catch (error) {
        console.error('❌ [Azure] Error decodificando base64:', error);
        throw new BadRequestException('Error al decodificar la imagen Base64');
      }

      // Generar nombre único con timestamp y extensión
      const uniqueFileName = `${fileName}-${Date.now()}.${extension}`;
      console.log('🔵 [Azure] Nombre único generado:', uniqueFileName);
      
      const blockBlobClient = this.containerClient.getBlockBlobClient(uniqueFileName);

      // Subir la imagen con headers HTTP
      console.log('🔵 [Azure] Iniciando uploadData...');
      await blockBlobClient.uploadData(imageBuffer, {
        blobHTTPHeaders: {
          blobContentType: mimeType,
        },
      });

      console.log(`✅ [Azure] Imagen subida exitosamente: ${uniqueFileName}`);
      const url = blockBlobClient.url;
      console.log('✅ [Azure] URL generada:', url);
      return url;
    } catch (error) {
      console.error('❌ [Azure] Error subiendo imagen a Azure:', {
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
        errorStack: error.stack
      });
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
