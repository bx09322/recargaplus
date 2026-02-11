<?php
// TEST RÁPIDO - Telegram
define('BOT_TOKEN', '8234170971:AAH7Z8ySIHDs1tZmWTbFnAc90-RKdh26fwY');
define('CHAT_ID', '-1003832913889');

$msg = "🧪 TEST\n✅ Funciona!\n🕐 " . date('d/m/Y H:i:s');
$url = "https://api.telegram.org/bot" . BOT_TOKEN . "/sendMessage";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['chat_id' => CHAT_ID, 'text' => $msg]));
$res = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "<h1>Test Telegram</h1>";
echo "<p>HTTP: $code</p>";
echo "<pre>$res</pre>";
echo ($code == 200) ? "<h2 style='color:green'>✅ FUNCIONA</h2>" : "<h2 style='color:red'>❌ ERROR</h2>";
?>