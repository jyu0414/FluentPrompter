<?php

if(isset($_POST['sentence'])){
$sentence = $_POST['sentence'];

$api = "http://jlp.yahooapis.jp/FuriganaService/V1/furigana";
$appid = ""/*yahoo furigana変換のappid*/;

$params = array(
    "sentence" => $sentence
);
 
$ch = curl_init($api);
curl_setopt_array($ch, array(
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_USERAGENT      => "Yahoo AppID: $appid",
    CURLOPT_POSTFIELDS     => http_build_query($params),
));
 
$result = curl_exec($ch);
curl_close($ch);
echo $result;

}
else{
    echo "could not get sentence";
}

//https://developer.yahoo.co.jp/appendix/request/rest/post.html
?>