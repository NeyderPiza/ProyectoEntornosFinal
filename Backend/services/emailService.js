// /backend/services/emailService.js (VERSIÓN FINAL CON SENDGRID)

const sgMail = require('@sendgrid/mail');

// Configuramos la clave de API desde las variables de entorno
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendConfirmationEmail = async (compraDetails) => {
    try {
        const { userEmail, peliculaTitulo, fechaFuncion, salaNombre, asientos, totalPagado } = compraDetails;
        const fechaFormateada = new Date(fechaFuncion).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' });

        // El objeto del mensaje para SendGrid es un poco diferente
        const msg = {
            to: userEmail,
            from: {
                email: process.env.EMAIL_FROM, // El remitente verificado
                name: 'NBL Cinemax',           // El nombre que verá el usuario
            },
            subject: '✅ Confirmación de tu compra en NBL Cinemax',
            // El HTML del correo se queda exactamente igual
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>¡Gracias por tu compra!</h2>
                    <p>Hola, hemos confirmado tu reserva. Aquí están los detalles:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background-color: #f2f2f2;"><td style="padding: 8px; border: 1px solid #ddd;"><strong>Película:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${peliculaTitulo}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Fecha y Hora:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${fechaFormateada}</td></tr>
                        <tr style="background-color: #f2f2f2;"><td style="padding: 8px; border: 1px solid #ddd;"><strong>Sala:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${salaNombre}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Asientos:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${asientos.join(', ')}</td></tr>
                        <tr style="background-color: #f2f2f2;"><td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Pagado:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">$${new Intl.NumberFormat('es-CO').format(totalPagado)}</td></tr>
                    </table>
                    <p>¡Disfruta de la función!</p>
                    <p><strong>- El equipo de NBL Cinemax</strong></p>
                </div>
            `,
        };

        // Enviamos el correo usando el SDK de SendGrid
        await sgMail.send(msg);
        console.log('Email de confirmación enviado a:', userEmail, 'vía SendGrid.');

    } catch (error) {
        // Este bloque de error es muy útil para depurar problemas con SendGrid
        console.error('Error al enviar el correo de confirmación con SendGrid:', error);
        if (error.response) {
            console.error(error.response.body);
        }
    }
};

module.exports = { sendConfirmationEmail };