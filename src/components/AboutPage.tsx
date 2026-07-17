import { Shield, Truck, Award, Gauge, Cog, Globe } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 md:py-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#003366] to-[#0055AA] text-white rounded-lg shadow-lg p-6 md:p-12 mb-8">
        <div className="max-w-3xl">
          <h1 className="mb-4 md:mb-6">About Max Bearings</h1>
          <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
            A specialist supplier of rolling bearings, mounted units, linear motion components and sealing 
            solutions. We help maintenance teams, manufacturers and distributors keep critical equipment moving.
          </p>
        </div>
      </div>

      {/* Values Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-[#DC143C] hover:shadow-md transition-shadow">
          <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-[#DC143C]" />
          </div>
          <h3 className="text-[#003366] mb-3">Integrity</h3>
          <p className="text-gray-600">
            We operate with transparency and honesty in every transaction, ensuring you can trust 
            every product and service we provide.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-[#FF9900] hover:shadow-md transition-shadow">
          <div className="bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Truck className="h-6 w-6 text-[#FF9900]" />
          </div>
          <h3 className="text-[#003366] mb-3">Reliability</h3>
          <p className="text-gray-600">
            Dependable supply and responsive support are at the heart of our operations. 
            We help you source the right components when uptime matters.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-[#003366] hover:shadow-md transition-shadow">
          <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Award className="h-6 w-6 text-[#003366]" />
          </div>
          <h3 className="text-[#003366] mb-3">Quality Assurance</h3>
          <p className="text-gray-600">
            Our range is selected for proven performance, traceability and the quality expectations of 
            industrial maintenance and OEM applications.
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-[#003366] mb-4">Our Story</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Max Bearings combines practical distribution experience with a focused understanding 
              of rotating equipment. From our Florida base, we serve customers who need dependable bearing and 
              power-transmission components for demanding applications.
            </p>
            <p>
              Our catalog includes deep groove, angular contact, spherical, cylindrical, tapered and needle roller 
              bearings, plus mounted units, housings, seals and linear motion products.
            </p>
            <p>
              We pair a clear online ordering experience with attentive product support, helping maintenance teams, 
              OEMs and resellers select components that fit their equipment and operating conditions.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-blue-50 rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-[#003366] mb-6">Our Mission & Vision</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-[#DC143C] mb-2">Mission</h3>
              <p className="text-sm text-gray-700">
                To make quality bearing and motion-control components easier to source, with knowledgeable service, 
                clear product information and reliable delivery.
              </p>
            </div>
            <div>
              <h3 className="text-[#003366] mb-2">Vision</h3>
              <p className="text-sm text-gray-700">
                To be the preferred industrial component partner for businesses that value uptime, accurate fitment 
                and lasting performance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products & Services */}
      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-12">
        <h2 className="text-[#003366] mb-6 text-center">Our Products & Services</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Gauge className="h-8 w-8 text-[#DC143C]" />
            </div>
            <h3 className="text-[#003366] mb-2">Rolling Bearings</h3>
            <p className="text-gray-600 text-sm">
              Ball, roller and thrust bearing solutions for motors, gearboxes, pumps, wheels and process equipment
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Cog className="h-8 w-8 text-[#FF9900]" />
            </div>
            <h3 className="text-[#003366] mb-2">Mounted & Linear Units</h3>
            <p className="text-gray-600 text-sm">
              Housed bearings, seals and linear-motion components for efficient, dependable machinery
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Globe className="h-8 w-8 text-[#003366]" />
            </div>
            <h3 className="text-[#003366] mb-2">Worldwide Delivery</h3>
            <p className="text-gray-600 text-sm">
              Reliable worldwide shipping with online ordering and dedicated technical support
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-lg p-6 md:p-8 mb-12">
        <h3 className="text-[#003366] mb-6 text-center">Our Core Values</h3>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="text-[#DC143C] mb-2">Customer Focus</h4>
            <p className="text-sm text-gray-700">
              Our customers' needs guide every decision we make. Your satisfaction is our priority.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="text-[#003366] mb-2">Innovation</h4>
            <p className="text-sm text-gray-700">
              We embrace technology to improve efficiency and enhance the online shopping experience.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-xl overflow-hidden border border-blue-100 shadow-sm mb-12">
        <div className="grid lg:grid-cols-[0.9fr_1.4fr]">
          <div className="bg-[#003366] text-white p-6 md:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#FFB000] mb-3">Manufacturer resources</p>
              <h2 className="mb-4">Brands we help you research</h2>
              <p className="text-blue-100 leading-relaxed">Explore official resources from leading bearing and power-transmission manufacturers before requesting a quote.</p>
            </div>
            <p className="text-sm text-blue-200 mt-8 pt-5 border-t border-blue-400/30">Availability and fitment are confirmed by Max Bearings for each enquiry.</p>
          </div>

          <div className="bg-white p-4 md:p-6 grid sm:grid-cols-2 gap-3">
            {[
              ['SKF', 'https://www.skf.com/group', 'Bearing and rotating-equipment resources'],
              ['Timken', 'https://www.timken.com/engineered-bearing-solutions/', 'Engineered bearing solutions'],
              ['Regal Rexnord', 'https://www.regalrexnord.com/products/powertrain', 'Powertrain product resources'],
              ['Nachi', 'https://www.nachiamerica.com/Bearings/', 'Bearing product and technical resources'],
            ].map(([name, url, detail]) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="group min-h-32 rounded-lg border border-gray-200 p-5 flex flex-col justify-between hover:border-[#FF9900] hover:shadow-md hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:ring-offset-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[#003366] text-lg font-semibold">{name}</h3>
                  <span className="shrink-0 w-9 h-9 rounded-full bg-orange-50 text-[#FF9900] flex items-center justify-center group-hover:bg-[#FF9900] group-hover:text-white transition-colors"><Globe className="h-4 w-4" /></span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 leading-snug">{detail}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-[#0055AA] group-hover:text-[#003366]">Visit official site →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 text-center">
        <h3 className="text-[#003366] mb-4">Experience & Expertise</h3>
        <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
          Our team brings hands-on distribution experience, strong supplier relationships and a practical approach 
          to industrial sourcing. We understand that the right bearing protects equipment reliability, productivity 
          and safety.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <span className="bg-blue-50 px-4 py-2 rounded-full">20+ Years Experience</span>
          <span className="bg-red-50 px-4 py-2 rounded-full">Florida Distribution</span>
          <span className="bg-orange-50 px-4 py-2 rounded-full">Worldwide Shipping</span>
          <span className="bg-blue-50 px-4 py-2 rounded-full">Quality Assured</span>
        </div>
      </div>
    </div>
  );
}
