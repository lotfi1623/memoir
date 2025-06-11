import nodemailer from 'nodemailer';
import {Resend} from 'resend';
import 'dotenv/config';


const resend = new Resend('re_EtAxYfkm_4CAbKpofjUA83KiCNRY74zeQ');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
  }
});


export const sendEmail = async (email, nomVacateur, prenomVacateur , dateFin) => {
  try {
    
    const mailOptions = {
    from: process.env.GMAIL_USER, 
    to: email, 
    subject: 'Fin de Contrat & Suppression de Compte',
    html: 
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #ffffff;">
  <h2 style="color: #c0392b; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
    Fin de Contrat & Suppression de Compte
  </h2>

  <p style="font-size: 16px; color: #333;">Bonjour <strong>${nomVacateur} ${prenomVacateur}</strong>,</p>

  <p style="font-size: 15px; color: #444; line-height: 1.6;">
    Nous vous informons que votre contrat d’enseignement au sein de notre établissement prendra fin le <strong>${dateFin}</strong>, conformément aux conditions établies.
  </p>

  <div style="background-color: #fff3f3; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0; font-size: 14px; color: #c0392b;">
      🔒 Votre compte personnel sera désactivé et supprimé de notre plateforme peu après cette date.
    </p>
  </div>

  <p style="font-size: 15px; color: #444;">
    Nous vous remercions sincèrement pour votre engagement, votre professionnalisme et le travail accompli durant votre période de collaboration avec nous.
  </p>

  <p style="font-size: 14px; color: #555;">
    📩 Pour toute question ou demande d'information complémentaire, n’hésitez pas à contacter l’administration.
  </p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999;">
    <p>Ceci est un message automatique. Merci de ne pas y répondre.</p>
  </div>
</div>
`
    
    };

    const info = await transporter.sendMail(mailOptions);
    return info;

} catch (error) {
    console.error('Failed to send email:', error);
    throw error;
}
};


export const sendEmailByGoogle = async (email , first_name , last_name ,password ) => {
  try {
    
    const mailOptions = {
    from: process.env.GMAIL_USER, 
    to: email, 
    subject: 'Appointment Confirmation',
    html: 
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #ffffff;">
  <h2 style="color: #2c3e50; border-bottom: 2px solid #4285f4; padding-bottom: 10px;">Confirmation de Nomination</h2>

  <p style="font-size: 16px; color: #333;">Bonjour <strong>${first_name} ${last_name}</strong>,</p>

  <p style="font-size: 15px; color: #444; line-height: 1.6;">
    Nous avons le plaisir de vous informer que vous avez été désigné en tant que 
    <strong>Chef de Département</strong>au sein de notre établissement.
  </p>

  <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #4285f4; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0; font-size: 14px;">
      <strong>🛡️ Informations de connexion :</strong><br>
      <strong>Email :</strong> ${email}<br>
      <strong>Mot de passe :</strong> ${password}<br>
    </p>
  </div>

  <p style="font-size: 15px; color: #444;">
    Nous comptons sur votre sérieux et votre engagement pour mener à bien cette responsabilité.
  </p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999;">
    <p>Ceci est un message automatique. Merci de ne pas y répondre.</p>
  </div>
</div>`
    
    };

    const info = await transporter.sendMail(mailOptions);
    return info;

} catch (error) {
    console.error('Failed to send email:', error);
    throw error;
}
}


export const sendEmailToVacateur = async (email, nomVacateur, prenomVacateur ) => {
  try {
    
    const mailOptions = {
    from: process.env.GMAIL_USER, 
    to: email, 
    subject: 'Acceptation de la demande d’inscription et signature du contrat',
    html: 
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #ffffff;">
  <h2 style="color: #27ae60; border-bottom: 2px solid #2ecc71; padding-bottom: 10px;">
    Confirmation d'Acceptation
  </h2>

  <p style="font-size: 16px; color: #333;">Bonjour <strong>${nomVacateur} ${prenomVacateur}</strong>,</p>

  <p style="font-size: 15px; color: #444; line-height: 1.6;">
    Nous avons le plaisir de vous informer que votre demande d'intégration en tant qu'enseignant vacataire a été <strong>acceptée</strong> par notre établissement.
  </p>

  <p style="font-size: 15px; color: #444; line-height: 1.6;">
    Nous vous invitons à déposer votre <strong>dossier administratif</strong> au niveau de l’administration dans les plus brefs délais afin de finaliser votre inscription.
  </p>

  <p style="font-size: 15px; color: #444; line-height: 1.6;">
    Par ailleurs, veuillez signer le <strong>contrat d’enseignement</strong> qui vous sera transmis sur place ou par email. La signature du contrat est obligatoire avant le début de toute activité d’enseignement.
  </p>

  <p style="font-size: 14px; color: #555;">
    📩 Pour toute question ou précision, n’hésitez pas à contacter le service des ressources humaines.
  </p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999;">
    <p>Ceci est un message automatique. Merci de ne pas y répondre.</p>
  </div>
</div>

`
    
    };

    const info = await transporter.sendMail(mailOptions);
    return info;

} catch (error) {
    console.error('Failed to send email:', error);
    throw error;
}
};



export const sendEmailErrorToEnseignant = async (email, nom, prenom, debut, fin, type, date, module ) => {
 try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Erreur dans la fiche de pointage',
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); background-color: #ffffff;">
  <h2 style="color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
    Erreur détectée
  </h2>

  <p style="font-size: 16px; color: #333;">Bonjour <strong>${nom} ${prenom}</strong>,</p>

  <p style="font-size: 15px; color: #444; line-height: 1.6;">
    Une erreur a été détectée dans votre fiche de pointage concernant la séance suivante :
  </p>

  <ul style="font-size: 15px; color: #444;">
  <li><strong>Date :</strong> ${date}</li>
    <li><strong>Heure :</strong> de ${debut} à ${fin}</li>
    <li><strong>Type :</strong> ${type}</li>
    <li><strong>Module :</strong> ${module}</li>
  </ul>

  <p style="font-size: 15px; color: #444;">
    Nous vous prions de bien vouloir vérifier et corriger cette fiche dans les plus brefs délais.
  </p>

  <p style="font-size: 14px; color: #555;">
    🕐 Merci de votre réactivité.
  </p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999;">
    <p>Ceci est un message automatique. Merci de ne pas y répondre.</p>
  </div>
</div>
`
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
} catch (error) {
    console.error('Failed to send email:', error);
    throw error;
}
};