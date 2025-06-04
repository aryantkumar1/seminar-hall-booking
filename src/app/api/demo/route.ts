// Demo API endpoint to showcase CI/CD pipeline
import { NextRequest, NextResponse } from 'next/server'

interface DemoResponse {
  message: string
  timestamp: string
  version: string
  environment: string
  pipeline_demo: {
    ci_cd_status: string
    monitoring_enabled: boolean
    features: string[]
  }
}

export async function GET(request: NextRequest) {
  const response: DemoResponse = {
    message: '🚀 CI/CD Pipeline Demo - Successfully deployed!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    pipeline_demo: {
      ci_cd_status: 'active',
      monitoring_enabled: true,
      features: [
        'GitHub Actions CI/CD',
        'Docker Containerization',
        'Terraform Infrastructure',
        'Prometheus Monitoring',
        'Grafana Dashboards',
        'Postman API Testing',
        'Auto-scaling',
        'Health Checks'
      ]
    }
  }

  return NextResponse.json(response)
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: 'POST method not implemented for demo endpoint' },
    { status: 405 }
  )
}
