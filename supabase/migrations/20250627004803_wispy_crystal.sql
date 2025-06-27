/*
  # Actualizar galería de imágenes del sorteo de trolling

  1. Cambios
    - Actualizar array de imágenes del sorteo de trolling
    - Agregar las 8 nuevas imágenes de productos de pesca
    - Mantener la imagen principal existente
*/

-- Actualizar el sorteo de trolling con las nuevas imágenes
UPDATE raffles
SET 
  images = ARRAY[
    'https://cdn.shopify.com/s/files/1/0205/5752/9188/files/1d180355-87c4-4719-a134-41dc5725ec64-Photoroom.jpg?v=1750983769',
    'https://cdn.shopify.com/s/files/1/0205/5752/9188/files/3c0c6310-58a7-4bb2-a706-61fd48c5e9b4-Photoroom.jpg?v=1750983769',
    'https://cdn.shopify.com/s/files/1/0205/5752/9188/files/bf296fe6-79bb-44f6-aab7-cfd7272b82fd-Photoroom.jpg?v=1750983769',
    'https://cdn.shopify.com/s/files/1/0205/5752/9188/files/c26fa5fe-04bd-4011-9819-4312887671d7-Photoroom.jpg?v=1750983769',
    'https://cdn.shopify.com/s/files/1/0205/5752/9188/files/c245788b-63d7-447f-ae5b-3bf80e021672-Photoroom.jpg?v=1750983769',
    'https://cdn.shopify.com/s/files/1/0205/5752/9188/files/41f3e74f-88bf-416f-b592-4c5117269ef3-Photoroom.jpg?v=1750983769',
    'https://cdn.shopify.com/s/files/1/0205/5752/9188/files/5597b221-0aea-4e58-8f76-a7a43e5fd738-Photoroom.jpg?v=1750983769',
    'https://cdn.shopify.com/s/files/1/0205/5752/9188/files/e8bc5495-fe46-42cf-b97c-d10e39475bb6-Photoroom.jpg?v=1750983769'
  ],
  updated_at = now()
WHERE name LIKE '%Trolling%' OR name LIKE '%trolling%';