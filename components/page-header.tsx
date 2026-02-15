interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        {/* Header Box */}
        <div className="bg-gray-50 rounded-lg p-8 md:p-12">
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-medium text-gray-900 mb-2">{title}</h1>
            <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
