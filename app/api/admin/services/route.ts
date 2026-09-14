import { NextResponse } from 'next/server'
import {
  getAllSignatureServices,
  createSignatureService,
  updateSignatureService,
  deleteSignatureService,
} from '@/lib/db'

export async function GET() {
  try {
    const services = await getAllSignatureServices()
    return NextResponse.json({ success: true, services })
  } catch (error) {
    console.error('API GET /api/admin/services error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load services' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, category, description, imageUrl, isActive, displayOrder } = body

    if (!name || !slug || !category || !description || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newService = await createSignatureService({
      name,
      slug,
      category,
      description,
      imageUrl,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder !== undefined ? displayOrder : 0,
    })

    return NextResponse.json(
      { success: true, service: newService },
      { status: 201 }
    )
  } catch (error) {
    console.error('API POST /api/admin/services error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, name, slug, category, description, imageUrl, isActive, displayOrder } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      )
    }

    const updatedService = await updateSignatureService(id, {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(isActive !== undefined && { isActive }),
      ...(displayOrder !== undefined && { displayOrder }),
    })

    if (!updatedService) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, service: updatedService })
  } catch (error) {
    console.error('API PATCH /api/admin/services error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Service ID is required' },
        { status: 400 }
      )
    }

    const deleted = await deleteSignatureService(id)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Service deleted successfully' })
  } catch (error) {
    console.error('API DELETE /api/admin/services error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
