import { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.css';
import { Head } from '@inertiajs/react';

const Home = () => {
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('student'); // 'student' or 'outsider'
  
  // Student-specific fields
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  
  // Outsider-specific fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [affiliation_or_office, setAffiliationOrOffice] = useState('');
  // Carousel state with consistent sizing
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "Science and Technology-Based Resource Management",
      description: "Implementing high quality research for sustainable agriculture and coastal resource management.",
      image: "/images/logos/picture1.jpg",
    },
    {
      title: "Academic Support and Internship Programs",
      description: "Providing laboratory support for student research and accommodating internship opportunities.",
      image: "/images/logos/picture2.jpg",
    },
    {
      title: "Innovative Research and Development",
      description: "Developing breakthrough methods in technology, land/water management, food security, and renewable energy.",
      image: "/images/logos/picture3.jpg",
    },
    {
      title: "Community Engagement and Capacity Building",
      description: "Conducting trainings, seminars, and extension services for sustainable development.",
      image: "/images/logos/picture4.jpg",
    }
  ];

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    
    const formData = {
      name,
      email,
      purpose: message, // Changed to match backend validation
      userType,
      ...(userType === 'student' ? {
        student_id: studentId,
        department,
        course,
        year,
        phone
      } : {
        address,
        affiliation_or_office,
        phone
      })
    };

    try {
      const endpoint = userType === 'student' 
        ? route('consultation.store') 
        : route('consultation.storeOutsider');
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      if (response.status === 201) {
        setIsSubmitted(true);
        // Reset form
        setName('');
        setEmail('');
        setMessage('');
        setStudentId('');
        setDepartment('');
        setCourse('');
        setYear('');
        setPhone('');
        setAddress('');
        setAffiliationOrOffice('');
        setTimeout(() => setIsSubmitted(false), 3000);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Submission error:', error.response?.data);
        alert('Failed to submit form. Please try again.');
      } else {
        console.error('Error submitting form:', error);
        alert('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="consultation-container">
      {/* Navigation */}
      <Head  title="Welcome">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
      </Head>
      <nav className="navbar bg-white shadow-md">
        <div className="navbar-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-30">
            <div className="flex items-center">
              <a href={route('consultation.home')} className="flex items-center">
                <img
                  src="https://www.carsu.edu.ph/wp-content/uploads/2024/10/CSU-logo-2-black-text-1-1.svg"
                  alt="CSU Logo"
                  className="h-40 w-auto mr-4"
                  style={{ maxWidth: 160 }}
                />
                <img
                  src="/images/logos/CSU_CREATE_Logo.png"
                  alt="CSU Logo"
                  className="h-20 w-auto mr-0"
                  style={{ maxWidth: 160 }}
                />
              </a>
            </div>
            <div className="hidden md:block">
              <ul className="nav-links flex space-x-8">
                {/* <li><a href="#home" className="text-gray-700 hover:text-green-600 transition duration-300">Home</a></li> */}
                <li><a href="#about" className="text-gray-700 hover:text-green-600 transition duration-300">About</a></li>
                <li><a href="#services" className="text-gray-700 hover:text-green-600 transition duration-300">Services</a></li>
                {/* <li><a href="#contact" className="text-gray-700 hover:text-green-600 transition duration-300">Contact</a></li> */}
                <li><a href="#contact" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300">Contact Us</a></li>
                <li><a href={route('login')} className="text-gray-700 hover:text-green-600 transition duration-300">Admin</a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Carousel with Fixed Size */}
      <section id="home" className="hero-section relative bg-gradient-to-r from-green-50 to-green-100 h-[600px] overflow-hidden">
        {/* Slides container */}
        <div className="relative w-full h-full" >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${currentSlide === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex flex-col md:flex-row items-center gap-12">
                  {/* Text content - fixed width */}
                  <div className="md:w-1/2 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                      {slide.title}
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                      {slide.description}
                    </p>
                  </div>
                  
                  {/* Image container - fixed size */}
                  <div className="md:w-1/2 h-[400px] flex items-center justify-center">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover rounded-lg shadow-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation indicators */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="flex justify-center space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-green-600' : 'bg-gray-300'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full shadow-md z-10"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 p-2 rounded-full shadow-md z-10"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">About CReATe Center</h2>
            <div className="w-20 h-1 bg-green-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Pioneering innovation in resource assessment and agricultural technologies
            </p>
          </div>

          {/* Content Grid */}
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left Column - Image */}
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="/images/logos/picture5.jpg" 
                  alt="Research team at CReATe Center, Caraga State University"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <p className="text-white text-sm font-medium">
                    CReATe researchers conducting field assessments in Caraga region
                  </p>
                </div>
              </div>
              <br />
              
              {/* Mission & Vision Cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-green-50 p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-2 rounded-full mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Mission</h3>
                  </div>
                  <p className="text-gray-700">
                    To lead in innovative resource assessment and precision agriculture technologies through cutting-edge research that enhances productivity and builds climate-resilient farming communities.
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Vision</h3>
                  </div>
                  <p className="text-gray-700">
                    To become Mindanao's premier research hub for smart, sustainable agricultural solutions by 2030, ensuring food security through data-driven innovations.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="lg:w-1/2 order-1 lg:order-2">
              {/* Center Introduction */}
              <div className="mb-10">
                <h1 className="text-3xl font-semibold text-gray-800 mb-6">
                  Center for Resource Assessment, Analytics and Emerging Technologies
                </h1>
                
                <div className="space-y-5 text-gray-700">
                  <p>
                    The <span className="font-semibold text-green-700">Caraga Resource Assessment, Analytics and Emerging Technologies Center (CReATe)</span> is a flagship research center under the College of Engineering and Geosciences at Caraga State University.
                  </p>
                  
                  <p>
                    Our core competencies include:
                  </p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Advanced agricultural and biosystems engineering research</li>
                    <li>High-performance computing and data analytics</li>
                    <li>Emerging technology development and implementation</li>
                    <li>Professional training and extension services</li>
                    <li>Technology transfer and commercialization</li>
                  </ul>
                  
                  <p className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-600 italic">
                    Originally established as the Center for Renewable Energy and Alternative Technology (CREATe), we evolved into our current form following significant capability enhancements through the PhilLiDAR 2 project and in response to the region's rich natural resource endowment.
                  </p>
                </div>
              </div>
              {/* Achievements */}
              {/* <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Our Achievements</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "15+", label: "Years of Operation", icon: "🏛️" },
                    { value: "48", label: "Research Projects", icon: "🔬" },
                    { value: "96%", label: "Satisfaction Rate", icon: "👍" },
                    { value: "12", label: "Expert Researchers", icon: "👨‍🔬" }
                  ].map((item, index) => (
                    <div key={index} className="text-center p-4">
                      <span className="text-4xl block mb-2">{item.icon}</span>
                      <p className="text-3xl font-bold text-green-600">{item.value}</p>
                      <p className="text-gray-600 mt-1 text-sm">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section py-20 bg-gray-50">
        <div className="section-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Services</h2>
            <div className="w-20 h-1 bg-green-600 mx-auto mb-6"></div>
          </div>
          
          <div className="services-grid grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Land and Water Resources Service */}
            <div className="service-card bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 border-t-4 border-green-500">
              <div className="icon-container bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Trainings and Consultancy on Land and Water Resources Engineering and Technology</h3>
              <p className="text-gray-600 mb-4">
                Consultations, trainings, and referrals on GIS operations for creating, processing, and analyzing agrometeorological, hydrologic, and resource maps including vulnerability and suitability assessments.
              </p>
              {/* <a href="#contact" className="text-green-600 font-medium hover:text-green-700 transition duration-300 inline-flex items-center">
                Learn more <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </a> */}
            </div>

            {/* Agricultural Bio-Processing Service */}
            <div className="service-card bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 border-t-4 border-green-500">
              <div className="icon-container bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Trainings and Consultancy on Agricultural Bio-Processing</h3>
              <p className="text-gray-600 mb-4">
                Trainings and consultations on handling, storage, and processing of agricultural materials, including equipment design to reduce postharvest losses and add economic value using advanced analytical tools.
              </p>
              {/* <a href="#contact" className="text-green-600 font-medium hover:text-green-700 transition duration-300 inline-flex items-center">
                Learn more <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </a> */}
            </div>

            {/* Agricultural Machinery Service */}
            <div className="service-card bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 border-t-4 border-green-500">
              <div className="icon-container bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Trainings and Consultancy on Agricultural Machinery & Structures Designs</h3>
              <p className="text-gray-600 mb-4">
                Our professional Agricultural and Biosystems Engineers provide trainings, consultations, designs, and analyses for agricultural machinery and structures using state-of-the-art facilities.
              </p>
              {/* <a href="#contact" className="text-green-600 font-medium hover:text-green-700 transition duration-300 inline-flex items-center">
                Learn more <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </a> */}
            </div>

            {/* Rice Machinery Operations Service */}
            <div className="service-card bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 border-t-4 border-green-500">
              <div className="icon-container bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Trainings and Assessment for Rice Machinery Operations NCII</h3>
              <p className="text-gray-600 mb-4">
                TESDA-supported trainings and assessments for Rice Machinery Operations National Certificate II, available to students, professionals, and farmers.
              </p>
              {/* <a href="#contact" className="text-green-600 font-medium hover:text-green-700 transition duration-300 inline-flex items-center">
                Learn more <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </a> */}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-20 bg-green-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="testimonial-card bg-green-900 bg-opacity-10 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500 mr-4 overflow-hidden">
                  <img src="https://randomuser.me/api/portraits/women/43.jpg" alt="Client" className="w-full h-full object-cover"/>
                </div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-green-100 text-sm">Career Counseling Client</p>
                </div>
              </div>
              <p className="italic">"The career guidance I received was transformative. I now have clarity and confidence in my professional path."</p>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                ))}
              </div>
            </div>
            <div className="testimonial-card  bg-green-900 bg-opacity-10 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500 mr-4 overflow-hidden">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Client" className="w-full h-full object-cover"/>
                </div>
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <p className="text-green-100 text-sm">Family Therapy Client</p>
                </div>
              </div>
              <p className="italic">"Our family communication has improved dramatically thanks to the sessions at Harmony. Highly recommend!"</p>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                ))}
              </div>
            </div>
            <div className="testimonial-card  bg-green-900 bg-opacity-10 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500 mr-4 overflow-hidden">
                  <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Client" className="w-full h-full object-cover"/>
                </div>
                <div>
                  <h4 className="font-semibold">Emily Rodriguez</h4>
                  <p className="text-green-100 text-sm">Personal Counseling Client</p>
                </div>
              </div>
              <p className="italic">"The compassionate approach of my counselor helped me through a very difficult time. Forever grateful."</p>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section py-20 bg-white">
        <div className="section-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h2>
          <div className="w-20 h-1 bg-green-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">Schedule a consultation with our agricultural technology experts</p>
        </div>
          <div className="contact-content grid md:grid-cols-2 gap-12">
            <div className="contact-info">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 p-2 rounded-full mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Email</p>
                    <a href="mailto:info@harmonyconsult.com" className="text-green-600 hover:text-green-700 transition duration-300">create@carsu.edu.ph</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 p-2 rounded-full mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Phone</p>
                    <a href="tel:1234567890" className="text-green-600 hover:text-green-700 transition duration-300">09304529690</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 p-2 rounded-full mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Address</p>
                    <p className="text-gray-800">CReATe Office, 2nd Floor Hinang Building, Caraga State University-Main Campus Ampayon, Butuan City, Agusan del Norte 8600</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-10 mb-4">Business Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="text-gray-800 font-medium">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Saturday</span>
                  <span className="text-gray-800 font-medium">Closed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="text-gray-800 font-medium">Closed</span>
                </div>
              </div>
              
              {/* <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="social-icon bg-green-100 w-10 h-10 rounded-full flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
                  </a>
                  <a href="#" className="social-icon bg-green-100 w-10 h-10 rounded-full flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748 1.15.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"></path></svg>
                  </a>
                  <a href="#" className="social-icon bg-green-100 w-10 h-10 rounded-full flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                  </a>
                  <a href="#" className="social-icon bg-green-100 w-10 h-10 rounded-full flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
                  </a>
                </div>
              </div> */}
            </div>
            
            <div className="contact-form">
              {isSubmitted ? (
                <div className="success-message bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <span>Thank you for your message! We'll get back to you within 24 hours.</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User Type Selection */}
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-5 w-5 text-green-600"
                          name="userType"
                          value="student"
                          checked={userType === 'student'}
                          onChange={() => setUserType('student')}
                        />
                        <span className="ml-2 text-gray-700">Student</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-5 w-5 text-green-600"
                          name="userType"
                          value="outsider"
                          checked={userType === 'outsider'}
                          onChange={() => setUserType('outsider')}
                        />
                        <span className="ml-2 text-gray-700">Outsider</span>
                      </label>
                    </div>
                  </div>

                  {/* Common Fields */}
                  <div className="form-group">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                      required
                    />
                  </div>

                  {/* Student Specific Fields */}
                  {userType === 'student' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                        <input
                          type="text"
                          id="studentId"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input
                          type="text"
                          id="department"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                        <input
                          type="text"
                          id="course"
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                        <input
                          type="text"
                          id="year"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Outsider Specific Fields */}
                  {userType === 'outsider' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          type="text"
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="office" className="block text-sm font-medium text-gray-700 mb-1">Office/Organization</label>
                        <input
                          type="text"
                          id="affiliation_or_office"
                          value={affiliation_or_office}
                          onChange={(e) => setAffiliationOrOffice(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Purpose of Consultation</label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md transition duration-300 shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="footer-col">
              <h3 className="text-lg font-semibold mb-4">CReATe</h3>
              <p className="text-gray-400">Providing expert guidance for personal and professional growth since 2010.</p>
            </div>
            <div className="footer-col">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {/* <li><a href="#home" className="text-gray-400 hover:text-green-400 transition duration-300">Home</a></li> */}
                <li><a href="#about" className="text-gray-400 hover:text-green-400 transition duration-300">About Us</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-green-400 transition duration-300">Services</a></li>
                {/* <li><a href="#contact" className="text-gray-400 hover:text-green-400 transition duration-300">Contact</a></li> */}
              </ul>
            </div>
            <div className="footer-col">
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href={route('tracking.main')} className="text-gray-400 hover:text-green-400 transition duration-300">Borrow Equipment</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">Consultation in the Center</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest updates and tips.</p>
            </div>
          </div>
          {/* <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} CReATe. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748 1.15.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"></path></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition duration-300">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
              </a>
            </div>
          </div> */}
        </div>
      </footer>
    </div>
  );
};

export default Home;