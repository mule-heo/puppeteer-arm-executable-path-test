# Puppeteer ARM (aarch64) executablePath Test

이 레포지토리는 **ARM(aarch64) 환경에서 Puppeteer 실행 경로(executablePath) 및 브라우저 설치 동작을 검증**하기 위한 테스트/재현용 프로젝트입니다.

특히 다음 두 가지 실행 컨텍스트를 모두 포함합니다.

- ✅ aarch64 머신에 **직접 clone 후 실행**
- ✅ **Docker를 이용해 aarch64 VM에서 빌드 및 실행**

---

## 🎯 목적

- ARM(aarch64) 환경에서 Puppeteer가 사용하는 Chromium/Chrome 실행 경로 확인
- Puppeteer 버전과 Chromium revision 매칭 검증
- Docker / non-Docker 환경 간 동작 차이 비교
- 자동 Chromium 다운로드 동작 제어 방법 정리

---

## 🧪 테스트 시나리오 (TODO)

- [ ] aarch64 머신에 직접 clone하여 실행
- [ ] Docker를 이용하여 aarch64 VM에 빌드하여 실행
- [ ] amd64 환경과 결과 비교
- [ ] Puppeteer-managed Chromium vs system Chrome 비교

---

## 🏗️ 실행 환경

- Node.js: 24+
- Puppeteer: package.json 기준
- Architecture: `aarch64 (arm64)`
- OS 예시:

  - Ubuntu 20.04 / 22.04 / 24.04 (ARM)
  - ARM VM / ARM 서버 / Apple Silicon (Docker ARM)

아키텍처 확인:

```bash
uname -m
node -p "process.arch"
```

---

## ▶️ 1. aarch64 머신에서 직접 실행

```bash
git clone https://github.com/mule-heo/puppeteer-arm-executable-path-test.git
cd puppeteer-arm-executable-path-test

yarn install
yarn node index.js
```

실행 중 다음 정보를 출력하도록 구성하는 것을 권장합니다.

```js
console.log("arch:", process.arch);
console.log("platform:", process.platform);
console.log("puppeteer:", require("puppeteer/package.json").version);
console.log("browser path:", require("puppeteer").executablePath());
```

---

## ▶️ 2. Docker를 이용한 aarch64 VM 실행

### Dockerfile 예시

```dockerfile
FROM --platform=linux/arm64 node:24

WORKDIR /app
COPY package*.json ./

RUN apt-get update && apt-get install -y \
  chromium-browser \
  fonts-liberation \
  libnss3 \
  libatk-bridge2.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2

RUN yarn install
RUN yarn dlx puppeteer browsers install

COPY . .
CMD ["yarn", "node", "index.js"]
```

### 빌드 및 실행

```bash
docker buildx build --platform linux/arm64 -t puppeteer-arm-executable-path-test .
docker run puppeteer-arm-executable-path-test
```

---

## ⚠️ 주의사항: Puppeteer Chromium 자동 다운로드

Puppeteer는 기본적으로 설치 시 **Chromium을 자동 다운로드**하며,
다음 경로에 저장합니다.

```text
~/.cache/puppeteer
```

이는 다음과 같은 문제를 유발할 수 있습니다.

- CI / Docker 이미지 용량 증가
- 캐시 경로 권한 문제
- 불필요한 Chromium 중복 설치

---

## 🛑 자동 Chromium 다운로드 방지 방법

### 방법 1️⃣ Puppeteer 다운로드 완전 비활성화 (권장)

```bash
export PUPPETEER_SKIP_DOWNLOAD=true
yarn install
```

이 경우 반드시 **system Chrome / Chromium 경로를 직접 지정**해야 합니다.

```js
puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
});
```

---

### 방법 2️⃣ Puppeteer 캐시 디렉토리 변경

```bash
export PUPPETEER_CACHE_DIR=/tmp/puppeteer-cache
yarn install
```

또는 XDG 표준 사용:

```bash
export XDG_CACHE_HOME=/tmp/.cache
```

결과:

```text
/tmp/puppeteer-cache
/tmp/.cache/puppeteer
```

---

### 방법 3️⃣ Docker에서 캐시 제거

```dockerfile
RUN rm -rf /root/.cache/puppeteer
```

또는

```dockerfile
ENV PUPPETEER_SKIP_DOWNLOAD=true
```

---

## ✅ 권장 Best Practice

| 환경            | 권장 설정                      |
| --------------- | ------------------------------ |
| 로컬 ARM 테스트 | Puppeteer-managed Chromium     |
| CI / Docker     | `PUPPETEER_SKIP_DOWNLOAD=true` |
| 재현용 레포     | 명시적 `executablePath`        |

---

## 📌 참고 출력 예시

```text
arch: arm64
platform: linux
puppeteer: 23.x.x
browser path: /app/node_modules/puppeteer/.local-chromium/linux-arm64/chrome
```

---

## 📄 License

MIT

---

## Replacing puppeteer with playwright

ARM 기반 Ubuntu + Docker 환경에서 chromium 미제공, chromium-browser는 snap 강제. playwright로의 변경을 시도한다.

### ▶️ Playwright 실행 관련 (선택)

- 첫 설치 시 브라우저 자동 다운로드 비활성화

```bash
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
yarn install
```

- 이후 필요한 브라우저만 다운로드

```bash
# 사용법
yarn playwright install [options] [browser...]

# 설치 가능한 브라우저: chromium | firefox | webkit | ...
yarn playwright install chromium
yarn playwright install --with-deps chromium   # 의존성 포함 설치 (Docker/CI 권장)
yarn playwright install chromium firefox
```

- 캐시/설치 경로

  - 기본: `~/.cache/ms-playwright`
  - 변경(예):
    ```bash
    export PLAYWRIGHT_BROWSERS_PATH=/tmp/ms-playwright
    ```

- Docker 예시

```dockerfile
# Playwright 브라우저 자동 다운로드 방지 후, 필요한 것만 설치
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN yarn install && yarn playwright install --with-deps chromium
```

- 런타임 예시

```js
// Playwright가 설치한 Chromium 사용
import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });

// 시스템 Chromium 명시 사용 예시
const browserSys = await chromium.launch({
  executablePath: "/usr/bin/chromium-browser",
});
```
