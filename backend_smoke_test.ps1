$base='http://localhost:8081'
Write-Output "Testing backend at $base"
$t = Test-NetConnection -ComputerName 'localhost' -Port 8081
Write-Output ('PortListening: ' + $t.TcpTestSucceeded)

try {
    $r = Invoke-WebRequest -Uri $base -Method Get -UseBasicParsing -ErrorAction Stop
    Write-Output ('ROOT_STATUS: ' + $r.StatusCode)
} catch {
    Write-Output ('ROOT_ERROR: ' + $_.Exception.Message)
    if ($_.Exception.Response) {
        $resp = $_.Exception.Response
        $sr = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
        Write-Output $sr
    }
}

try {
    $o = Invoke-WebRequest -Uri ($base + '/api/tasks') -Method Options -Headers @{ Origin = 'http://localhost:5174' } -UseBasicParsing -ErrorAction Stop
    Write-Output ('OPTIONS_STATUS: ' + $o.StatusCode)
    Write-Output ('OPTIONS_HEADERS:')
    $o.Headers.GetEnumerator() | ForEach-Object { Write-Output ("  $($_.Name): $($_.Value)") }
} catch {
    Write-Output ('OPTIONS_ERROR: ' + $_.Exception.Message)
    if ($_.Exception.Response) {
        $resp = $_.Exception.Response
        $sr = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
        Write-Output $sr
    }
}

$ts=Get-Date -Format yyyyMMddHHmmss
$user = "smoke_$ts"
$pwd = 'Test1234!'
Write-Output ('Using test user: ' + $user)
$body = @{ username = $user; password = $pwd } | ConvertTo-Json

try {
    $reg = Invoke-RestMethod -Uri ($base + '/api/auth/register') -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
    Write-Output ('REGISTER_OK: ' + ($reg | ConvertTo-Json -Compress))
} catch {
    Write-Output ('REGISTER_ERR: ' + $_.Exception.Message)
    if ($_.Exception.Response) {
        $resp = $_.Exception.Response
        $sr = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
        Write-Output $sr
    }
}

try {
    $login = Invoke-RestMethod -Uri ($base + '/api/auth/login') -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
    Write-Output ('LOGIN_OK: ' + ($login | ConvertTo-Json -Compress))
    $token = $login.token
} catch {
    Write-Output ('LOGIN_ERR: ' + $_.Exception.Message)
    $token = $null
}

# Call debug endpoint under /api/auth to inspect stored user (dev-only)
try {
    $dbg = Invoke-RestMethod -Uri ($base + '/api/auth/debug/' + $user) -Method Get -ErrorAction Stop
    Write-Output ('DEBUG_USER: ' + ($dbg | ConvertTo-Json -Compress))
} catch {
    Write-Output ('DEBUG_ERR: ' + $_.Exception.Message)
    if ($_.Exception.Response) {
        $resp = $_.Exception.Response
        $sr = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
        Write-Output $sr
    }
}

if ($token) {
    $hdr = @{ Authorization = ('Bearer ' + $token); 'Content-Type' = 'application/json' }
    try {
        $addBody = @{ title = 'smoke-test task'; completed = $false } | ConvertTo-Json
        $add = Invoke-RestMethod -Uri ($base + '/api/tasks') -Method Post -Body $addBody -Headers $hdr -ContentType 'application/json' -ErrorAction Stop
        Write-Output ('ADD_OK: ' + ($add | ConvertTo-Json -Compress))
    } catch {
        Write-Output ('ADD_ERR: ' + $_.Exception.Message)
        if ($_.Exception.Response) {
            $resp = $_.Exception.Response
            $sr = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
            Write-Output $sr
        }
    }

    try {
        $list = Invoke-RestMethod -Uri ($base + '/api/tasks') -Method Get -Headers $hdr -ErrorAction Stop
        Write-Output ('LIST_COUNT: ' + $list.Length)
        Write-Output ('LIST_SAMPLE: ' + ($list | Select-Object -First 3 | ConvertTo-Json -Compress))
    } catch {
        Write-Output ('LIST_ERR: ' + $_.Exception.Message)
    }

    try {
        $toDel = $list | Where-Object { $_.title -eq 'smoke-test task' }
        if ($toDel) {
            foreach ($t in $toDel) {
                Invoke-RestMethod -Method Delete -Uri ($base + '/api/tasks/' + $t.id) -Headers $hdr -ErrorAction Stop
                Write-Output ('DELETED: ' + $t.id)
            }
        } else {
            Write-Output 'NO_CLEANUP_FOUND'
        }
    } catch {
        Write-Output ('CLEANUP_ERR: ' + $_.Exception.Message)
    }
} else {
    Write-Output 'NO_TOKEN: aborting add/list/cleanup.'
}
