# CryptoPulse Engine: Scalable High-Frequency Financial Metrics Layer

CryptoPulse is a production-grade, containerized microservices architecture built to ingest, cache, analyze, and distribute high-frequency cryptocurrency metrics. The system is designed to handle extreme concurrent traffic seamlessly by decoupling data ingestion from request handling, implementing multi-instance horizontal scaling, and leveraging strategic layer caching.

## Architecture Highlights
- **Reverse Proxy & Load Balancing:** Nginx acts as a layer-7 load balancer distributing client traffic across scaled Node.js upstream instances using a Round-Robin algorithm.
- **Decoupled Data Ingestion:** A dedicated background worker node runs independently to handle continuous third-party API polling, avoiding duplicate execution and ensuring zero impact on user-facing APIs.
- **Multi-Level Data Strategy:** - **In-Memory Cache (Redis):** Serves real-time data queries with $O(1)$ time complexity, ensuring lightning-fast reads under heavy load.
  - **Persistent Analytics Layer (MongoDB):** Implements compound indexing for historical queries and automatic self-maintenance via Time-To-Live (TTL) indexing.
- **Frontend Layer:** Built with React, Tailwind CSS, and GSAP for fluid, non-blocking real-time metric animations.

## Tech Stack
- **Runtime Environment:** Node.js, Docker, Docker Compose
- **Gateway & Load Balancer:** Nginx (Alpine)
- **Caching Layer:** Redis (Alpine)
- **Database:** MongoDB (WiredTiger Storage Engine)
- **Backend Framework:** Express.js, Mongoose
- **Frontend UI:** React, Vite, Tailwind CSS, GSAP, Lucide Icons
- **Performance Evaluation:** Artillery Performance Testing Framework

## Performance Benchmark Results
Under structural load testing simulating heavy concurrent usage, the architecture demonstrated extreme resilience:
- **Total Requests Handled:** 1,500 requests within a 30-second window.
- **Throughput:** ~279 requests per second.
- **Success Rate:** 100% (Zero dropped requests, zero failures).
- **Latency Profile:** Minimum latency of 3ms (Cache Hit), with a 99th percentile (p99) response time remaining well under 140ms under continuous peak stress.

## Infrastructure Configuration & Deployment

### Prerequisites
- Docker Desktop installed and running
- Node.js (v20+ alpine used inside containers)

### Setup & Execution
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd cryptopulse
