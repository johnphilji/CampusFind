# CampusFind — College Lost & Found Cloud Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Cloud](https://img.shields.io/badge/AWS-ap--south--1-orange.svg)](https://aws.amazon.com/)
[![Node](https://img.shields.io/badge/Node.js-v20-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/PostgreSQL-16.9-blue.svg)](https://www.postgresql.org/)

CampusFind is a full-stack, cloud-native lost-and-found portal built for college campuses. It allows students to report lost items, register found items with photo uploads, browse listings with instant category and search filters, and submit secure ownership verification claims. 

Deployed to Amazon Web Services (AWS) using a cost-effective, Well-Architected single-AZ lab deployment for the Cloud Computing Lab (CCL) mini-project.

---

## 🌐 Live Deployment
- **Web Application URL**: [http://43.205.113.108:5000](http://43.205.113.108:5000)
- **Live Health Check Endpoint**: [http://43.205.113.108:5000/api/health](http://43.205.113.108:5000/api/health)
- **AWS Region**: `ap-south-1` (Mumbai)

---

## 🏗️ Cloud Architecture

```
                    Internet Users / Browser
                              │
                    [Port 80 / 5000 (HTTP)]
                              ▼
┌───────────────────────── campusfind-vpc (10.0.0.0/16) ─────────────────────────┐
│                                                                                │
│  ┌────────────────────── Public Subnets ────────────────────────────────────┐  │
│  │  Internet Gateway: igw-05dc1a832adb9fadc                                 │  │
│  │                                                                          │  │
│  │  [EC2 Instance: campusfind-app-server (t3.micro - 43.205.113.108)]       │  │
│  │  ├── Node.js 20 Express Backend                                          │  │
│  │  ├── React 19 Frontend Static SPA                                        │  │
│  │  ├── Background SQS Long-Polling Worker                                  │  │
│  │  └── IAM Role: campusfind-backend-role (Least Privilege)                │  │
│  └──────────────────────────┬───────────────────────────────────────────────┘  │
│                             │                                                  │
│                    [Port 5432 (SSL/TLS)]                                       │
│                             │                                                  │
│  ┌────────────────────── Private Subnets ───────────────────────────────────┐  │
│  │  campusfind-db-subnet-group (10.0.10.0/24 & 10.0.11.0/24)                 │  │
│  │                                                                          │  │
│  │  [Amazon RDS PostgreSQL 16.9 Single-AZ (campusfind-db)]                   │  │
│  │  └── Strictly isolated from public internet                              │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
[Amazon S3 Bucket]        [Amazon SQS Queue]          [Amazon SNS Topic]
campusfind-uploads-       campusfind-claims-queue     campusfind-claims-topic
880690594539              (Asynchronous Claim         (Claim Decisions &
(Item Photos & Evidence)   Lifecycle Processing)       Status Broadcasts)
      │                           │                           │
      └───────────────────────────┼───────────────────────────┘
                                  ▼
                     [AWS SSM Parameter Store]
                     ├── /campusfind/database_url (SecureString)
                     ├── /campusfind/jwt_secret   (SecureString)
                     └── /campusfind/node_env
                                  ▼
                       [Amazon CloudWatch]
                     ├── Log Group: /aws/campusfind/backend
                     └── CPU Alarm: campusfind-high-cpu (>80%)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Lucide Icons |
| **Backend** | Node.js 20 LTS, Express, TypeScript, `pg` (PostgreSQL Client with SSL) |
| **Database** | Amazon RDS for PostgreSQL (Engine 16.9 Single-AZ, 20GB gp3) |
| **Object Storage**| Amazon S3 (Direct presigned uploads, strict evidence isolation) |
| **Compute** | Amazon EC2 (`t3.micro`, Amazon Linux 2023, PM2 process management) |
| **Networking**| Custom Amazon VPC (2 Public & 2 Private subnets across 2 AZs, IGW) |
| **Security & Secrets**| AWS Systems Manager Parameter Store, Least-Privilege IAM Roles |
| **Async Messaging**| Amazon SQS (Decoupled claim processor) & Amazon SNS (Notifications) |
| **Monitoring & Cost**| Amazon CloudWatch Metrics/Alarms & AWS Budgets |

---

## 🔐 Critical Ownership Claim Workflow (Section 4.C)

To prevent fraud, disputes, and simultaneous claim collisions:
1. **Self-Claim Prevention**: The reporting user cannot claim their own found/lost item (`403 Forbidden`).
2. **Duplicate Claim Prevention**: Claimant cannot submit multiple active claims for the same item (`409 Conflict`).
3. **Database Concurrency Lock**: Approvals use PostgreSQL transactions with `SELECT ... FOR UPDATE` row-level locks.
4. **Single-Approval Invariant**: Once an item claim is marked `Approved`, all other pending claims are automatically archived/rejected and the item transitions to `claimed`.
5. **Private Evidence Isolation**: Private proof keys are never included in public listings and can only be reviewed with short-lived presigned URLs by administrators.
6. **Handover Lifecycle**: Supports `Item Returned` (resolving the listing) and `reopen` (restoring an item to `open` if uncollected).

---

## 🧪 Automated Testing Verification

CampusFind includes a dedicated 20-point CCL test suite (`src/ccl_verification.test.ts`) executed via Vitest:

```bash
npx vitest run src/ccl_verification.test.ts
```

**Results:**
```
 ✓ src/ccl_verification.test.ts (20 tests) 14ms
 Test Files  1 passed (1)
      Tests  20 passed (20)
```

The test suite validates:
1. User registration and login validation contracts.
2. Lost-item reporting schema validation.
3. Found-item reporting schema validation.
4. Keyword and category filtering query logic.
5. S3 upload filename sanitization & key formatting.
6. Ownership claim submission contract.
7. Self-claim prevention guard.
8. Duplicate active-claim prevention guard.
9. Private evidence access control (omission in public responses).
10. Claim approval/rejection state transitions.
11. Competing approval collision lock.
12. Claim restrictions on returned/closed items.
13. Handover lifecycle ('Item Returned' -> 'resolved').
14. Database schema definition (5 core tables).
15. S3 bucket integration naming and rules.
16. SQS asynchronous payload structure.
17. SNS notification contract (privacy preservation).
18. Backend role-based authorization guards.
19. CloudWatch CPU alarm configuration.
20. Deployed health API response contract.

---

## 💰 AWS Cost & Resource Safety

To stay within Free Tier limits and prevent unexpected charges:
- **No NAT Gateway**: Eliminated ~$32/month NAT Gateway charges by placing EC2 in the public subnet and using an Internet Gateway.
- **Single-AZ RDS**: Utilizes cost-effective `db.t4g.micro` with 20GB gp3 storage.
- **Micro Compute**: `t3.micro` EC2 compute.
- **AWS Budget Created**: Configured `campusfind-monthly-budget` with a strict **$10 USD threshold** and email alerts.

### 🧹 Resource Teardown Instructions
To destroy resources after the practical examination:
```bash
# 1. Terminate EC2
aws ec2 terminate-instances --instance-ids i-05f31951b1b2d63bd --region ap-south-1 --profile campusfind

# 2. Delete RDS
aws rds delete-db-instance --db-instance-identifier campusfind-db --skip-final-snapshot --region ap-south-1 --profile campusfind

# 3. Empty & Delete S3 Bucket
aws s3 rm s3://campusfind-uploads-880690594539 --recursive --region ap-south-1 --profile campusfind
aws s3api delete-bucket --bucket campusfind-uploads-880690594539 --region ap-south-1 --profile campusfind

# 4. Delete SQS & SNS
aws sqs delete-queue --queue-url https://sqs.ap-south-1.amazonaws.com/880690594539/campusfind-claims-queue --region ap-south-1 --profile campusfind
aws sns delete-topic --topic-arn arn:aws:sns:ap-south-1:880690594539:campusfind-claims-topic --region ap-south-1 --profile campusfind

# 5. Delete VPC and Subnets
aws ec2 delete-security-group --group-id sg-0357db9f3e6143ee5 --region ap-south-1 --profile campusfind
aws ec2 delete-security-group --group-id sg-02b7192cb27e6ea69 --region ap-south-1 --profile campusfind
aws ec2 detach-internet-gateway --internet-gateway-id igw-05dc1a832adb9fadc --vpc-id vpc-0da36c9d88a0bea09 --region ap-south-1 --profile campusfind
aws ec2 delete-internet-gateway --internet-gateway-id igw-05dc1a832adb9fadc --region ap-south-1 --profile campusfind
aws ec2 delete-vpc --vpc-id vpc-0da36c9d88a0bea09 --region ap-south-1 --profile campusfind
```
