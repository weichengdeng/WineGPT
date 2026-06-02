param(
    [string]$CsvPath = ".\twinpeaks_wine_products_en.csv",
    [string]$OutputDir = ".\product_images"
)

$ErrorActionPreference = "Stop"

function Get-SafeName {
    param([string]$Value)
    $safe = $Value -replace '[\\/:*?"<>|]', '_' -replace '\s+', '_'
    $safe = $safe.Trim('_')
    if ($safe.Length -gt 80) {
        $safe = $safe.Substring(0, 80)
    }
    return $safe
}

function Get-ImageExtension {
    param([string]$Url)
    $path = ([Uri]$Url).AbsolutePath
    $ext = [System.IO.Path]::GetExtension($path)
    if ([string]::IsNullOrWhiteSpace($ext)) {
        return ".jpg"
    }
    return $ext
}

function Get-ProductImages {
    param([string]$Html)

    $matches = [regex]::Matches(
        $Html,
        '<script[^>]+type=["'']application/ld\+json["''][^>]*>(.*?)</script>',
        [System.Text.RegularExpressions.RegexOptions]::Singleline
    )

    foreach ($match in $matches) {
        $jsonText = [System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value.Trim())
        try {
            $data = $jsonText | ConvertFrom-Json
        }
        catch {
            continue
        }

        if ($data.'@type' -eq "Product" -and $data.image) {
            @($data.image) | Where-Object { $_ -match '^https?://' }
            return
        }
    }
}

New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$products = Import-Csv -Path $CsvPath | Sort-Object product_id -Unique
$manifest = New-Object System.Collections.Generic.List[object]

foreach ($product in $products) {
    $productId = $product.product_id
    $productName = $product.product_name
    $sourceUrl = $product.source_url

    if ([string]::IsNullOrWhiteSpace($sourceUrl)) {
        Write-Warning "Skipping $productId because source_url is empty."
        continue
    }

    $safeName = Get-SafeName $productName
    $productDir = Join-Path $OutputDir "$productId`_$safeName"
    New-Item -ItemType Directory -Path $productDir -Force | Out-Null

    Write-Host "Fetching $productId $productName"
    $html = & curl.exe -L --fail --silent --show-error --user-agent "Mozilla/5.0" $sourceUrl
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to fetch $sourceUrl"
    }

    $imageUrls = @((Get-ProductImages $html) | Select-Object -Unique)
    if ($imageUrls.Count -eq 0) {
        Write-Warning "No product images found for $productId $productName"
        continue
    }

    for ($i = 0; $i -lt $imageUrls.Count; $i++) {
        $imageUrl = [string]$imageUrls[$i]
        $index = "{0:D2}" -f ($i + 1)
        $ext = Get-ImageExtension $imageUrl
        $filePath = Join-Path $productDir "$productId`_$index$ext"

        Write-Host "  Downloading image $index"
        & curl.exe -L --fail --silent --show-error --user-agent "Mozilla/5.0" --output $filePath $imageUrl
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to download $imageUrl"
        }

        $manifest.Add([pscustomobject]@{
            product_id = $productId
            product_name = $productName
            source_url = $sourceUrl
            image_index = $i + 1
            image_url = $imageUrl
            local_path = $filePath
        })
    }
}

$manifestPath = Join-Path $OutputDir "image_manifest.csv"
$manifest | Export-Csv -Path $manifestPath -NoTypeInformation -Encoding UTF8
Write-Host "Saved $($manifest.Count) images. Manifest: $manifestPath"
