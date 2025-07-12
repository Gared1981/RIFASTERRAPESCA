import React, { useState } from 'react';
import { supabase, Ticket, User } from '../utils/supabaseClient';
import { Check, X, Download, Search, Mail, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendDirectEmail } from '../utils/notificationUtils';

interface AdminTicketTableProps {
  tickets: Array<Ticket & { user?: User }>;
  onRefresh: () => Promise<void>;
}

const AdminTicketTable: React.FC<AdminTicketTableProps> = ({ tickets, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.number.includes(searchTerm) ||
      ticket.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.phone?.includes(searchTerm);
      
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleSelectTicket = (id: number) => {
    setSelectedTickets(prev => 
      prev.includes(id) 
        ? prev.filter(ticketId => ticketId !== id) 
        : [...prev, id]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map(t => t.id));
    }
  };
  
  const confirmPayment = async () => {
    if (selectedTickets.length === 0) {
      toast.error('Selecciona al menos un boleto');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'purchased',
          purchased_at: new Date().toISOString() 
        })
        .in('id', selectedTickets);
        
      if (error) throw error;
      
      toast.success(`${selectedTickets.length} boleto(s) marcados como pagados`);
      setSelectedTickets([]);
      onRefresh();
    } catch (err) {
      console.error('Error confirming payment:', err);
      toast.error('Hubo un error al confirmar el pago');
    }
  };
  
  const releaseTickets = async () => {
    if (selectedTickets.length === 0) {
      toast.error('Selecciona al menos un boleto');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'available',
          user_id: null,
          reserved_at: null,
          purchased_at: null
        })
        .in('id', selectedTickets);
        
      if (error) throw error;
      
      toast.success(`${selectedTickets.length} boleto(s) liberados`);
      setSelectedTickets([]);
      onRefresh();
    } catch (err) {
      console.error('Error releasing tickets:', err);
      toast.error('Hubo un error al liberar los boletos');
    }
  };
  
  const sendManualEmail = async (ticket: Ticket & { user?: User }) => {
    if (!ticket.user) {
      toast.error('No hay información de usuario para este boleto');
      return;
    }
    
    if (!ticket.user.email) {
      toast.error('Este usuario no tiene email registrado');
      return;
    }
    
    try {
      // Get raffle information
      const { data: raffle, error: raffleError } = await supabase
        .from('raffles')
        .select('name, price')
        .eq('id', ticket.raffle_id)
        .single();
        
      if (raffleError) throw raffleError;
      
      // Send email notification
      if (ticket.user.email) {
        const emailSent = await sendDirectEmail(
          ticket.user.email,
          `Confirmación de Boleto #${ticket.number} - ${raffle.name}`,
          `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #003B73; color: white; padding: 20px; text-align: center;">
            <h1>¡Boleto Confirmado!</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hola ${ticket.user.first_name} ${ticket.user.last_name},</p>
            
            <p>Tu boleto para el sorteo <strong>${raffle.name}</strong> ha sido confirmado.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Detalles de tu boleto:</h3>
              <p><strong>Número de boleto:</strong> ${ticket.number}</p>
              <p><strong>Estado:</strong> ${ticket.status === 'purchased' ? 'Pagado' : 'Reservado'}</p>
              <p><strong>Fecha de compra:</strong> ${new Date(ticket.purchased_at || '').toLocaleString()}</p>
            </div>
            
            <p>Puedes verificar el estado de tu boleto en cualquier momento visitando <a href="https://sorteosterrapesca.com/verificar">nuestra página de verificación</a>.</p>
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos:</p>
            <ul>
              <li>WhatsApp: +52 668 688 9571</li>
              <li>Email: ventasweb@terrapesca.com</li>
            </ul>
            
            <p>¡Buena suerte en el sorteo!</p>
            
            <p>Atentamente,<br>
            Equipo de Sorteos Terrapesca</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>© ${new Date().getFullYear()} Sorteos Terrapesca. Todos los derechos reservados.</p>
          </div>
        </body>
        </html>
          `,
          { isHtml: true }
        );
        
        if (emailSent) {
          toast.success(`Correo enviado a ${ticket.user.email}`);
        } else {
          toast.error('Error al enviar el correo');
        }
      } else {
        toast.error('Este usuario no tiene email registrado');
      }
    } catch (err) {
      console.error('Error sending email:', err);
      toast.error('Error al enviar el correo');
    }
  };
  
  const sendManualWhatsApp = (ticket: Ticket & { user?: User }) => {
    if (!ticket.user) {
      toast.error('No hay información de usuario para este boleto');
      return;
    }
    
    if (!ticket.user.phone) {
      toast.error('Este usuario no tiene teléfono registrado');
      return;
    }
    
    // Clean the phone number (remove any non-digits)
    const cleanPhone = ticket.user.phone.replace(/\D/g, '');
    
    // Add Mexico country code if not present
    let formattedPhone = cleanPhone;
    if (cleanPhone.length === 10) {
      formattedPhone = `52${cleanPhone}`;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) {
      formattedPhone = cleanPhone;
    }
    
    // Create message
    const message = `🎉 ¡Hola ${ticket.user.first_name}!
Tu boleto #${ticket.number} ha sido registrado con éxito en Sorteos Terrapesca 🎣
¡Estás oficialmente dentro! 🙌

Ahora solo queda cruzar los dedos 🤞 y esperar que la suerte esté de tu lado 🍀
¡Gracias por participar y mucha suerte! 🎁

#EquipaTuAventura 🌊`;
    
    // Create WhatsApp link
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };
  
  const exportToCSV = () => {
    try {
      // Prepare data
      const csvData = filteredTickets.map(ticket => ({
        numero: ticket.number,
        estado: ticket.status,
        nombre: ticket.user?.first_name || '',
        apellidos: ticket.user?.last_name || '',
        telefono: ticket.user?.phone || '',
        estado_usuario: ticket.user?.state || '',
        fecha_reserva: ticket.reserved_at || '',
        fecha_pago: ticket.purchased_at || ''
      }));
      
      // Convert to CSV
      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `tickets-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Archivo CSV generado');
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      toast.error('Error al generar el archivo CSV');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número, nombre o teléfono..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="available">Disponibles</option>
              <option value="reserved">Reservados</option>
              <option value="purchased">Pagados</option>
            </select>
          </div>
        </div>
        
        {selectedTickets.length > 0 && (
          <div className="flex items-center mt-4 gap-2">
            <button
              onClick={confirmPayment}
              className="inline-flex items-center px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
            >
              <Check size={16} className="mr-1" />
              Confirmar pago
            </button>
            <button
              onClick={releaseTickets}
              className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
            >
              <X size={16} className="mr-1" />
              Liberar boletos
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
            >
              <Download size={16} className="mr-1" />
              Exportar CSV
            </button>
            <span className="text-sm text-gray-500 ml-2">
              {selectedTickets.length} boletos seleccionados
            </span>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filteredTickets.length > 0 && selectedTickets.length === filteredTickets.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Reserva
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(ticket.id)}
                      onChange={() => handleSelectTicket(ticket.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {ticket.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ticket.status === 'available' ? 'bg-green-100 text-green-800' : 
                      ticket.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {ticket.status === 'available' ? 'Disponible' : 
                       ticket.status === 'reserved' ? 'Reservado' : 'Pagado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.user ? `${ticket.user.first_name} ${ticket.user.last_name}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.user?.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.user?.state || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.reserved_at ? new Date(ticket.reserved_at).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {ticket.status === 'purchased' && (
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => sendManualEmail(ticket)}
                          className="inline-flex items-center px-2 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                          title="Enviar correo"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </button>
                        <button
                          onClick={() => sendManualWhatsApp(ticket)}
                          className="inline-flex items-center px-2 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700"
                          title="Enviar WhatsApp"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          WhatsApp
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron boletos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTicketTable;