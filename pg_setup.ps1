Restart-Service -Name 'postgresql-x64-16' -Force
Start-Sleep -Seconds 3
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -U postgres -p 5433 -h 127.0.0.1 -c "CREATE DATABASE registro_discapacidad;"
& 'C:\Program Files\PostgreSQL\16\bin\psql.exe' -U postgres -p 5433 -h 127.0.0.1 -c "ALTER USER postgres PASSWORD 'postgres';"
"DONE" | Out-File "C:\Users\Usuario\Desktop\SistemaRegistroDiscapacidad\pg_setup.log"
