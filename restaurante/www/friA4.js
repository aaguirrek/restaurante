if($("#sunatqr").text()!=""){
    var qr=$('#sunatqr').text();
    $('#sunatqr').html("");
    $('#sunatqr').qrcode({width: 150,height: 150,text:qr}); 
}