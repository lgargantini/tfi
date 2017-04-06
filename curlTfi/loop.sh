echo "setting headers"
echo "size_header, size_request, time_namelookup, time_connect, time_appconnect, time_pretransfer, time_redirect, time_starttransfer, time_total" > resHttp10.csv
echo "size_header, size_request, time_namelookup, time_connect, time_appconnect, time_pretransfer, time_redirect, time_starttransfer, time_total" > resHttps10.csv
echo "size_header, size_request, time_namelookup, time_connect, time_appconnect, time_pretransfer, time_redirect, time_starttransfer, time_total" > resHttp100.csv
echo "size_header, size_request, time_namelookup, time_connect, time_appconnect, time_pretransfer, time_redirect, time_starttransfer, time_total" > resHttps100.csv
echo "size_header, size_request, time_namelookup, time_connect, time_appconnect, time_pretransfer, time_redirect, time_starttransfer, time_total" > resHttp200.csv
echo "size_header, size_request, time_namelookup, time_connect, time_appconnect, time_pretransfer, time_redirect, time_starttransfer, time_total" > resHttps200.csv
echo "done!"

echo "curl loop 10 ..."
for ((i=1;i<=10;i++)); 
do
curl -w "@curl-format.txt" -o /dev/null -s http://tfium.eastus.cloudapp.azure.com:8000 >> resHttp10.csv;
curl -w "@curl-format.txt" -o /dev/null -s https://tfium.eastus.cloudapp.azure.com >> resHttps10.csv;
done

echo "curl loop 100 ..."
for ((i=1;i<=100;i++)); 
do
curl -w "@curl-format.txt" -o /dev/null -s http://tfium.eastus.cloudapp.azure.com:8000 >> resHttp100.csv;
curl -w "@curl-format.txt" -o /dev/null -s https://tfium.eastus.cloudapp.azure.com >> resHttps100.csv;
done

echo "curl loop 200 ..."
for ((i=1;i<=200;i++)); 
do 
curl -w "@curl-format.txt" -o /dev/null -s http://tfium.eastus.cloudapp.azure.com:8000 >> resHttp200.csv;
curl -w "@curl-format.txt" -o /dev/null -s https://tfium.eastus.cloudapp.azure.com >> resHttps200.csv;
done

echo "done -> bye!"