const sgMail = require('@sendgrid/mail');
const moment = require('moment-timezone');

exports.sendBuyerEmail = (order) => {
    console.log('***** sendBuyerEmail called')    
    sgMail.setApiKey(process.env.ARDENE_SENDGRID_API_KEY);

    console.log('process.env.ARDENE_SENDGRID_API_KEY',
        process.env.ARDENE_SENDGRID_API_KEY)

    if(!order.shippingInfo.email) return

    const msg = {
        to: 'kkwilson27@hotmail.com',
        from: 'cat_man_shadow@hotmail.com',
        subject: 'Your  Order No. ' + order.orderNo, 
        text: 'Dear ' + order.shippingInfo.firstName + ', \n\n' +
        'We are pleased to inform you that your order for placed on ' + moment.tz(order.created_on, 'America/Toronto').format('MM-DD-YYYY') + 
        ' has been shipped and is expected to arrive on ..\n\n Kind regards,\n\n Wannet Global, Inc.',
        // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    try {
        sgMail.send(msg);    
    } catch(error) {
        console.log('errorX sendBuyerEmail', error);
        error.message = 'Problem sending buyer confirmation email`.';
        error.status = '500';
        throw error;
    }
    
}