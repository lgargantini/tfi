echo "setting headers"
echo "size_header size_request time_namelookup time_connect time_appconnect time_pretransfer time_redirect time_starttransfer time_total" > resH1_10.csv
echo "size_header size_request time_namelookup time_connect time_appconnect time_pretransfer time_redirect time_starttransfer time_total" > resH1s_10.csv
echo "size_header size_request time_namelookup time_connect time_appconnect time_pretransfer time_redirect time_starttransfer time_total" > resH2_10.csv
echo "size_header size_request time_namelookup time_connect time_appconnect time_pretransfer time_redirect time_starttransfer time_total" > resH1_20.csv
echo "size_header size_request time_namelookup time_connect time_appconnect time_pretransfer time_redirect time_starttransfer time_total" > resH1s_20.csv
echo "size_header size_request time_namelookup time_connect time_appconnect time_pretransfer time_redirect time_starttransfer time_total" > resH2_20.csv
echo "size_header size_request time_namelookup time_connect time_appconnect time_pretransfer time_redirect time_starttransfer time_total" > resH1_100.csv
echo "size_header size_request time_namelookup time_connect time_appconnect time_pretransfer time_redirect time_starttransfer time_total" > resH1s_100.csv
echo "size_header size_request time_namelookup time_connect time_appconnect time_pretransfer time_redirect time_starttransfer time_total" > resH2s_100.csv
echo "done!"

echo "curl loop 10 ..."
for ((i=1;i<=10;i++)); 
do
curl -w "@curl-format.txt" -o /dev/null -s http://tfium.eastus.cloudapp.azure.com:5000 >> resH1_10.csv;
curl -w "@curl-format.txt" -o /dev/null -s https://tfium.eastus.cloudapp.azure.com:8000 >> resH1s_10.csv;
curl -w "@curl-format.txt" -o /dev/null -s https://tfium.eastus.cloudapp.azure.com >> resH2_10.csv;
done

echo "curl loop 20 ..."
for ((i=1;i<=20;i++)); 
do 
curl -w "@curl-format.txt" -o /dev/null -s http://tfium.eastus.cloudapp.azure.com:5000 >> resH1_20.csv;
curl -w "@curl-format.txt" -o /dev/null -s https://tfium.eastus.cloudapp.azure.com:8000 >> resH1s_20.csv;
curl -w "@curl-format.txt" -o /dev/null -s https://tfium.eastus.cloudapp.azure.com >> resH2_20.csv;
done

echo "curl loop 100 ..."
for ((i=1;i<=100;i++)); 
do
curl -w "@curl-format.txt" -o /dev/null -s https://tfium.eastus.cloudapp.azure.com:5000 >> resH1_100.csv;
curl -w "@curl-format.txt" -o /dev/null -s https://tfium.eastus.cloudapp.azure.com:8000 >> resH1s_100.csv;
curl -w "@curl-format.txt" -o /dev/null -s https://tfium.eastus.cloudapp.azure.com >> resH2_100.csv;
done

echo "done -> bye!"