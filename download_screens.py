import os
import urllib.request
import json
import re

def slugify(value):
    return re.sub(r'[\W_]+', '-', value.lower()).strip('-')

screens = [
    {
        "title": "3D BIM Viewer",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzgxNDA3NjM5N2U5MDRkMjk5NmE5YWVhM2MzZDAyZDIzEgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ujT6LoAnaC4geracPyPH_pVPk-QHslwdrzQFrN_d2Kyui2heJFzykisxhPATjtt8oHLeOEkGBakS7qSEdVmBhyvCN974KOR-7VYP4Xx-p12wuh2w6yJKzulD7ApaGn_MmrVviueAgkEugx0PI4vUz94jtcvx4XmczmOjplo-H3oEskyWYYOcvrJrRCcVDEilOsrvGGEPkn5dHNOnIxB0TOnPX1-PgKxB1azmdceE8ctFgfY8Tkq7X-d1TIG"
    },
    {
        "title": "Project Dashboard",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2M5Y2Q2NDc5OGVjZjQ5ZTI4MWM3M2MyYzI0OGM3MTNkEgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uiHz6P3Ud_zCVMCzR7DEJeNa0bvSI_BRCu-FroSRKW1xsyqEQ1MzY2SEVrlcN_H8OJ08OqaDWkXA8XqOBIO_v5HzAkHhoZzKuAfXW2w1ysEYzl-TxYkd2aNQiAjcygbQHxLFCf1Z3aEho1YuJCOgm8p2J0OxwYQ-Et6WGe3SeJmXOUudbkt-rcVPLU3VueurinpZTFBS6cJ8msy_yQTCRCgMsHk7Kn3cv3YMR9vwg0RY3kN1OGM_BlPuN2g"
    },
    {
        "title": "Clash Management List",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzE1MjY1ZDA3YjkwMDQ2NTg5MjExYTYzYzI2MjY5YmNlEgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ujAVEmewt5x5KENfiVSgDxao5zYxsnCP6q-mqUkwYxVFltX97vIhf30lnbZbtwfGhC-GaHhZ_UzW3R1DLC0D7pUHO5FFt52qt-CYPiHBTyUo6MNssXjZxWBVziHpCpv_YhAUxuyzJFUByN0QjcVt9TgWodzjjLo6v4JdbuqzSvMCHg2GAY1la8eNJZ9wX0S97bYzLE-kSmVfDmpzW-_U0PAK8Gb83bUKgyQ_hwV3SWs7VlMjE0Qm50a2KZ1"
    },
    {
        "title": "Reports & Analytics",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzM4NGIxYmEwOGRiODQxMDY4MWU5NWI0N2ZhY2Q0NzIxEgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uhdN3VGjyqqC-3fWb3_fl9S0LWEIKpn9NO_nN1V9Yi5rb_3rmBfaZ80mnal1ZIOry4QXqPkYWdP3ndkRM3clUtBNjypKjfm0np9or-NwTL_thqqjU2fRSuBZmEPOPBQZIleijdnLgGnElLOwE76-39F3dtHhvoTWN4D3AqPjLeSuwRxVjCzy7FMVGv92q8PaI1qZkcs9FVsV9tiLDroQ-qNt1K6z3LvQubAXuXrB7RQzpuNoQ7VnBsu28e5"
    },
    {
        "title": "AI Rerouting Analysis",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzhiMGM0MjUyYWI5NTRiZTU4YzgwM2E0NDQ5NmQ4ZjhlEgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ujwTLsy69j2n-Q11ttUuYSutRMEaPiI7BnR551mWxxGE7Sv32RauyvupcAJZQSsOjHLqatXSv4qRDISzu47hdDboUp-vxTOosJtNEKPPxnaen1Dre75fqDuEso-_8YgZdchVzQDQNC9zlo4iX8A-gXzUrmykvG9QUGMmiByqR5_RFJGwZ0xnPr4oCIQY0ZGJO6UIKEaVQ1cDcR6m6tgMNUEDqBd4KOMoJU_nqUsfGKCkcX-h3qd_7n5stFk"
    },
    {
        "title": "AR Field Overlay",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzkzNDA0NzJhODBkMjQ1MmY5MjE2NmYwNDgxNTBjYzA3EgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ujCV-7fOm-Kp6kkMuR77j1Wm8rTwM2c7gRFIz3p0wHMaFfKxZkE-qtKYzLmuPNs_XzZpyNxUUxfvdFeHDqJwmCCWOZKqtpsmlmOpjK9h1rMNZvL81JBZDhNkzLdL2tjZJ34MB1wR-IiLiSldumQEBqjZT2KQEojJBz6lf56eQHw2idSI5qJx-0o8oN1BqMWgdsLW_kNgf6h3hrGt_5CHd7BkzyTBeplVfPCnjc402SiTS3EMVlJsaXSrxlo"
    },
    {
        "title": "Upload & Processing",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzBlNDUwYzA0MTRjYzRjMmM4MTdhODY2MmIzZTY1NGQxEgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uiSISlI5opkV8CY1YVJ2eca8V8K5DbSTPOWxF6UI-UgSQZiusrvqBQ2mTt4hSMqPxWpXLrLBf4KxV9xr0ga0p1LBI5PhYvIxgyrwHuF-PUiwIGPm-_GF88svADke6YukX1G75jRakaG5q_hV1oYumqA_KxBis9dONrpdyOnODHNDVScRv5I7v02yib2ccZ45OaQP6oDqsBRC53qAS-sm8cwjChA1_l-f80LgKkJQ9qoPY0wxBp5Ajd6sjWS"
    },
    {
        "title": "Reroute Results Review",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzI5OTU3MTNiNWM0MzQwYjg5MGExOGE3OGM5MmE5NTAwEgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uiRQrT1xe2YGkq18pCRf0t1Ut_pqEBdCyEdZs-cQWb434llwoQw4lLSIVPAw5e6DOHkMOMoqs5btg0OowkTgCK-z4TRQuyR1RHBJ5_GZVt0OBUBE3sMUYgtFLQItZl-gAHBCSVcZEf1ivcTU0V5EHlvaesJH8C4SqpYXvK5O2d3tS7_phIqqfTD4NNlG-KRmkex-STTcvggUta26ECGz1-EE7QYeTEqHj0TXi2iFbFIF77nDCFMj4xfSunR"
    },
    {
        "title": "Batch AI Reroute Management",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2M4MjA4ZDg0YmFkMjQzOGI4MDE4N2EyM2QxNjY1MTBjEgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ujfkqszvAycKrhu0TNitUQct0wBxedZIfz5NihXkXoB4-hGaLdWiO8yCLSyTyjm5SNNoWYdHu5VI0Ya03FQXfkW9Liv-UlNXSGr2xC0dhu9uMQIlrr3n4UD2wBUKCSs1CgleV8Mlp2XWm4w2ztREAV4k0pVZ_HZF3PZMYQNaAebnaGMo1tb_TTyoJqEr4DqlDNIAeoguUtNyEkbFXFKNbv5TlFXBS8zrW0mNKPPYdUWrsnkN1EkB9fWYeaS"
    },
    {
        "title": "AI Reroute Request Modal",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2M4MDFmOWU0MmJkNDRjZWU5M2Q0MDkzZmZjZDBhOGZkEgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uihHUmaV2RADH5WYJI9I7HUQXeHWjQRFiem6g1n7tSxzF_Vmf8kzVqKgHQGSr-0JZyKDXsc5EEeTZYg6M7kAGectILtFmaSV5c9s6AIbl_Sy7TCJyESU1X_HG1Bu7tEy6687cqiBfQdT7Yue_vc3OkJWmif4Ng6wqVxiYzGjcxsNPW8Kjzsv0ptC9RRsE_USjpLqYeFcy7igokDK-WLkpM_4R1NT_NuwhYxPsVKHJceyqk3WEO8tcF2OPxV"
    },
    {
        "title": "Reroute Execution History",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzE3MDMxOGZlMDc3NzQ4OTU5YzU2YmE1NzA5ODA5ZDQxEgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uhuXddYoGTzGDabbRxq3i72jVOoEua_fHQU37Q65whMJjMRRgSmE8M-1IzxG0uID6n9jb0CEJM4aujrh6pM-P1iAqauqiFRdfqyoINfMGDwpvTMNe0RGcArM2VIRJOgDv2b7NMsTSgExrGQuRg5rtKKuFMVq-egwNndNcmGzf_2gcAFf0k69JGUsMTdWJdsz1BaZsR7R7ohjsI3hzL91sRuQVChP2JaF4PYiZYgF2TQtE9hh7M37jTmstWo"
    },
    {
        "title": "User Profile & Team Management",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2U1MTMyMTYyZTY5NDRkMTViM2U4NjVmZTBhMGNjMzc4EgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uiBPwjI9KcbfwTcQhH9U_BVgzwNB4b-HgqqFbdW3Qlo8SMRCBp-iJ6k2UxC0IZhJrbB5v1orap6tq5GUANuQtTaSZBTMjokP9Bk0ff3JCKD1faaNXWUhVuFgJfg-GYHfFXm3YxoTKVZbzytjvow5nbOX4ce1EUqKzGpC_7ddpQ4cH52TJsWmzCOA-F0HxLxuA3THEQYDRyzLMcMMsG5E47nmaX07JebVS5QA7fBnUk-jVNFGm3P5IRcKtDN"
    },
    {
        "title": "Full AR Immersion Viewer",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2NiY2Y0ODg5YWE3ZjQyZjI4YjdkZTdhYzI4Y2E3YWEzEgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uiUOG51nwC3FdBk5UvfwCYgQOJtJXRuLiFMMjxvgGZmSy1dC9MQbu-Wv7pgmXLuIRhhi8WlAfZbyFOuOaIl0XSRNhKabWbSaIkaSM9i2pvfMwWzEUOoZU3494p1Ma_SnqtclR746uhTpVvgXiQGndLK8EddEZMud5HZdCFQz5J6TVkiZmF0tS9n9mqNrFsiLKsQhT1u0R6PPHscuZ3ivU9cl086Kdu6nf4Jj3ufGHKkJsoNkeTGiM54ETi6"
    },
    {
        "title": "Security Settings & 2FA Setup",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzY1MDM2Njc0ZjdiODQyNDU4YWNlYzE3OTY3NDFmZDNkEgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0uiAcv6gi6gkIBvV1OVHhunvRI_0j9-Er9aiYGdYRxON_AWdGOVlWEDF5ryjfH3pdNdoVUdvdzrRlxz0xegCtKU4eSTpOSU54uxh9MRFqg-jLHZUgt4DUB2QTNycbd2kgsbYjatfubryDmBXxIWB1FFP7OBHPZf_CIiOfDbAwvAmvXBkGWE3a8B7CK15V5G0gyEBruRVv8bAKpYv2pgZq7cWXURuKhRJczkuevMyABNCWzG2JDeS5zDHOQY"
    },
    {
        "title": "Role Permissions Customization",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzYzYWZlMDJjZjdjYzQ5NWViMjllZTVhODMwN2ZlMTFlEgsSBxC83buX9xEYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTg5ODQ1ODg0MTM4ODM1NzQwMw&filename=&opi=89354086",
        "img": "https://lh3.googleusercontent.com/aida/ADBb0ugHVCMwhjyTpIDCDA0s7u5fI1t1Mwoq9YifkFVTLVOkgYsQtpubllMnxwfZFDKJk4UmGMtXZWV7NX4E5jqQip5uAaYT-SPdHrTMkm7C2Q4P22eUSGFqXO2okZNLf0scxaOMil23udvAanGAtToyzzn4-PbHn_Qb6W7babMgQeDlxM9hoo97a_FcBSHnkJMlPxGM-5rbQ1vuQPtbYSNQ2aY7bLyKNder9_lBJMHhXW9d-iM4mKOvzuG46l7w"
    }
]

os.makedirs('frontend/images', exist_ok=True)

nav_links = []
for i, screen in enumerate(screens):
    slug = slugify(screen['title'])
    html_filename = f"{slug}.html"
    img_filename = f"{slug}.png"
    
    print(f"Downloading {screen['title']}...")
    
    # Download HTML
    req = urllib.request.Request(screen['html'], headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        html_code = response.read().decode('utf-8')
    with open(f"frontend/{html_filename}", "w", encoding="utf-8") as f:
        f.write(html_code)
        
    # Download Image
    req_img = urllib.request.Request(screen['img'], headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_img) as response:
        img_data = response.read()
    with open(f"frontend/images/{img_filename}", "wb") as f:
        f.write(img_data)
        
    nav_links.append(f'<li><a href="{html_filename}">{screen["title"]}</a></li>')

# Create an index.html file that links to all screens
index_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI MEP Clash Rerouting - Screens</title>
    <style>
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            margin: 0;
            padding: 40px;
        }}
        h1 {{
            color: #38bdf8;
            margin-bottom: 2rem;
        }}
        ul {{
            list-style: none;
            padding: 0;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }}
        li {{
            background: #1e293b;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #334155;
            transition: transform 0.2s, border-color 0.2s;
        }}
        li:hover {{
            transform: translateY(-4px);
            border-color: #38bdf8;
        }}
        a {{
            display: block;
            padding: 20px;
            color: #f8fafc;
            text-decoration: none;
            font-weight: 500;
        }}
        .img-container {{
            width: 100%;
            height: 200px;
            background-size: cover;
            background-position: top center;
            border-bottom: 1px solid #334155;
        }}
    </style>
</head>
<body>
    <h1>AI MEP Clash Rerouting - Screens</h1>
    <ul>
'''
for screen in screens:
    slug = slugify(screen['title'])
    index_html += f'''        <li>
            <div class="img-container" style="background-image: url('images/{slug}.png')"></div>
            <a href="{slug}.html">{screen['title']}</a>
        </li>
'''
index_html += '''    </ul>
</body>
</html>'''

with open("frontend/index.html", "w", encoding="utf-8") as f:
    f.write(index_html)

print("Done! Created frontend/ and downloaded all screens and images.")
