/*
  # Update raffle information for kayak prize
  
  1. Changes
    - Update existing raffle with new kayak information
    - Update price and draw date
*/

-- First, update the existing raffle
UPDATE raffles
SET 
  name = 'Kayak de Pesca Costa Fishing',
  description = '🎁 Premio incluye:
- 🚣‍♂️ 1 Kayak Costa Fishing (modelo Tilapia o similar)
- 🛶 1 remo de aluminio ligero
- 🦺 1 chaleco salvavidas tipo pesca
- 🎣 Combo de señuelos Costa Fishing Tackle (para pargo y robalo)
- 🧰 Accesorios especiales: portacañas, caja organizadora y más

Valor total del premio: $50,000 MXN',
  price = 50,
  draw_date = '2026-05-13 18:00:00-06',
  image_url = 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
WHERE active = true;