import { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.css';
import { Head } from '@inertiajs/react';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

const Home = () => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('student');
  const [appointmentDate, setAppointmentDate] = useState('');
  
  // Calendar view states
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Student-specific fields
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  
  // Outsider-specific fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [affiliation_or_office, setAffiliationOrOffice] = useState('');

  // Carousel state
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

  // Mock available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '01:00', '01:30',
    '02:00', '02:30', '03:00', '03:30',
    '04:00', '04:30'
  ];

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  // Handle date selection
  const handleDateClick = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setAppointmentDate(date.toISOString().split('T')[0]);
    setShowCalendarView(true);
    setSelectedTime(null);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (time: string) => {
  setSelectedTime(time);
  if (appointmentDate) {
    // Split the time into hours and minutes
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create a new Date object from the selected date
    const dateTime = new Date(appointmentDate);
    
    // Set the hours and minutes
    dateTime.setHours(hours, minutes, 0, 0);
    
    // Convert to ISO string and remove milliseconds/timezone
    const isoString = dateTime.toISOString().slice(0, 16);
    setAppointmentDate(isoString);
  }
};

  // Render calendar days
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div 
          key={`prev-${i}`} 
          className="h-12 p-1 text-center text-gray-400"
        >
          {prevMonthDays - firstDayOfMonth + i + 1}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = appointmentDate && new Date(appointmentDate).toDateString() === date.toDateString();
      const isPast = date < new Date() && !isToday;

      days.push(
        <div
          key={`day-${day}`}
          onClick={() => !isPast && handleDateClick(day)}
          className={`h-12 p-1 text-center cursor-pointer flex items-center justify-center
            ${isSelected ? 'bg-green-100 rounded-full' : ''}
            ${isToday ? 'font-bold text-green-600' : ''}
            ${isPast ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}
          `}
        >
          {day}
        </div>
      );
    }

    // Next month days
    const daysToShow = 42 - days.length; // 6 rows x 7 days
    for (let i = 1; i <= daysToShow; i++) {
      days.push(
        <div 
          key={`next-${i}`} 
          className="h-12 p-1 text-center text-gray-400"
        >
          {i}
        </div>
      );
    }

    return days;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Ensure the date is in the correct format
    let formattedAppointmentDate = appointmentDate;
    if (appointmentDate && !appointmentDate.includes('T')) {
      // If it's just a date without time, add a default time
      formattedAppointmentDate = `${appointmentDate}T00:00`;
    }
    const formData = {
      name,
      email,
      purpose: message,
      appointment_date: formattedAppointmentDate, 
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
        setAppointmentDate('');
        setSelectedTime(null);
        setTimeout(() => {
          setIsSubmitted(false);
          setIsModalOpen(false);
          setShowCalendarView(false);
        }, 3000);
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

  const resetForm = () => {
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
    setAppointmentDate('');
    setSelectedTime(null);
    setIsSubmitted(false);
    setIsModalOpen(false);
    setShowCalendarView(false);
  };


  return (
    <div className="consultation-container">
      {/* Navigation with subtle animation */}
      <Head title="Welcome">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
      </Head>
      <nav className="navbar bg-white shadow-md animate-fade-in-up">
        <div className="navbar-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-30">
            <div className="flex items-center">
              <a href={route('consultation.home')} className="flex items-center hover:scale-[1.02] transition-transform duration-300">
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
                <li><a href="#about" className="text-gray-700 hover:text-green-600 transition-all duration-300 hover:underline underline-offset-4">About</a></li>
                <li><a href="#services" className="text-gray-700 hover:text-green-600 transition-all duration-300 hover:underline underline-offset-4">Services</a></li>
                <li><a href="#contact" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all duration-300 hover:shadow-md">Contact Us</a></li>
                <li><a href={route('login')} className="text-gray-700 hover:text-green-600 transition-all duration-300 hover:underline underline-offset-4">Admin</a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Carousel */}
      <section id="home" className="hero-section relative bg-gradient-to-r from-green-50 to-green-100 h-[600px] overflow-hidden">
        {/* Floating leaf decorations */}
        <div className="absolute top-1/4 left-10 w-16 h-16 opacity-20 animate-float-leaf">
          <svg viewBox="0 0 100 100" className="text-green-800">
            <path fill="currentColor" d="M50,0 C60,20 80,30 80,50 C80,70 60,80 50,100 C40,80 20,70 20,50 C20,30 40,20 50,0 Z"/>
          </svg>
        </div>
        
        {/* Slides container */}
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 flex items-center ${currentSlide === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex flex-col md:flex-row items-center gap-12">
                  {/* Text content */}
                  <div className="md:w-1/2 text-center md:text-left space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 animate-fade-in-up">
                      {slide.title}
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 animate-fade-in-up delay-100">
                      {slide.description}
                    </p>
                    <button 
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-lg animate-fade-in-up delay-200"
                      onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Get Started
                    </button>
                  </div>
                  
                  {/* Image container */}
                  <div className="md:w-1/2 h-[400px] flex items-center justify-center animate-fade-in-up delay-300">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover rounded-lg shadow-xl transition-transform duration-500 hover:scale-105"
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
                className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-green-600 scale-125' : 'bg-gray-300'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 p-3 rounded-full shadow-md z-10 transition-all duration-300 hover:scale-110"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 p-3 rounded-full shadow-md z-10 transition-all duration-300 hover:scale-110"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* About Section with Enhanced Animations */}
      <section id="about" className="py-20 bg-white relative overflow-hidden">
        {/* Floating elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 opacity-5 animate-float">
          <svg viewBox="0 0 200 200" className="text-green-800">
            <path fill="currentColor" d="M100,0 C120,40 160,60 160,100 C160,140 120,160 100,200 C80,160 40,140 40,100 C40,60 80,40 100,0 Z"/>
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2a5c3e] mb-4 animate-fade-in-up">About CReATe Center</h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-green-500 to-green-600 mx-auto mb-6 rounded-full animate-scale-x"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto animate-fade-in-up delay-100">
              Pioneering innovation in resource assessment and agricultural technologies
            </p>
          </div>

          {/* Content Grid */}
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left Column - Image */}
            <div className="lg:w-1/2 order-2 lg:order-1 space-y-6">
              <div className="relative rounded-xl overflow-hidden shadow-lg group animate-fade-in-up delay-200">
                <img 
                  src="/images/logos/picture5.jpg" 
                  alt="Research team at CReATe Center"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <p className="text-white text-sm font-medium">
                    CReATe researchers conducting field assessments in Caraga region
                  </p>
                </div>
              </div>
              
              {/* Mission & Vision Cards */}
              <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up delay-300">
                <div className="bg-green-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-2 rounded-full mr-4 group-hover:rotate-12 transition-transform duration-300">
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

                <div className="bg-blue-50 p-6 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-4 group-hover:-rotate-12 transition-transform duration-300">
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
            <div className="lg:w-1/2 order-1 lg:order-2 animate-fade-in-up delay-400">
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
                    <li className="hover:text-green-700 transition-colors duration-300">Advanced agricultural and biosystems engineering research</li>
                    <li className="hover:text-green-700 transition-colors duration-300">High-performance computing and data analytics</li>
                    <li className="hover:text-green-700 transition-colors duration-300">Emerging technology development and implementation</li>
                    <li className="hover:text-green-700 transition-colors duration-300">Professional training and extension services</li>
                    <li className="hover:text-green-700 transition-colors duration-300">Technology transfer and commercialization</li>
                  </ul>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-600 italic transition-all duration-300 hover:shadow-sm">
                    Originally established as the Center for Renewable Energy and Alternative Technology (CREATe), we evolved into our current form following significant capability enhancements through the PhilLiDAR 2 project and in response to the region's rich natural resource endowment.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section with Enhanced Animations */}
      <section id="services" className="services-section py-20 bg-gray-50 relative overflow-hidden">
        {/* Floating elements */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 opacity-5 animate-float-leaf-reverse">
          <svg viewBox="0 0 200 200" className="text-green-800">
            <path fill="currentColor" d="M100,0 C120,40 160,60 160,100 C160,140 120,160 100,200 C80,160 40,140 40,100 C40,60 80,40 100,0 Z"/>
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[#2a5c3e] mb-4 animate-fade-in-up">Our Services</h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-green-500 to-green-600 mx-auto mb-6 rounded-full animate-scale-x"></div>
          </div>
          
          <div className="services-grid grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Service cards with enhanced animations */}
            {[
              {
                title: "Trainings and Consultancy on Land and Water Resources Engineering and Technology",
                description: "Consultations, trainings, and referrals on GIS operations for creating, processing, and analyzing agrometeorological, hydrologic, and resource maps including vulnerability and suitability assessments.",
                icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
                delay: "delay-200"
              },
              {
                title: "Trainings and Consultancy on Agricultural Bio-Processing",
                description: "Trainings and consultations on handling, storage, and processing of agricultural materials, including equipment design to reduce postharvest losses and add economic value using advanced analytical tools.",
                icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
                delay: "delay-300"
              },
              {
                title: "Trainings and Consultancy on Agricultural Machinery & Structures Designs",
                description: "Our professional Agricultural and Biosystems Engineers provide trainings, consultations, designs, and analyses for agricultural machinery and structures using state-of-the-art facilities.",
                icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
                delay: "delay-400"
              },
              {
                title: "Trainings and Assessment for Rice Machinery Operations NCII",
                description: "TESDA-supported trainings and assessments for Rice Machinery Operations National Certificate II, available to students, professionals, and farmers.",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                delay: "delay-500"
              }
            ].map((service, index) => (
              <div 
                key={index}
                className={`service-card bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border-t-4 border-green-500 animate-fade-in-up ${service.delay}`}
              >
                <div className="icon-container bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 transition-transform duration-300">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d={service.icon}></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 group-hover:text-green-700 transition-colors duration-300">{service.title}</h3>
                <p className="text-gray-600 mb-4 group-hover:text-gray-800 transition-colors duration-300">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
     {/* Benefits / Why Choose Us Section with Animations */}
    <section className="benefits-section py-20 bg-gradient-to-b from-[#f0f7f2] to-[#e0efe5] relative overflow-hidden">
      {/* Floating leaf decorations */}
      <div className="absolute top-10 left-10 w-24 h-24 opacity-10 animate-float-leaf">
        <svg viewBox="0 0 100 100" className="text-green-800">
          <path fill="currentColor" d="M50,0 C60,20 80,30 80,50 C80,70 60,80 50,100 C40,80 20,70 20,50 C20,30 40,20 50,0 Z"/>
        </svg>
      </div>
      <div className="absolute bottom-20 right-16 w-20 h-20 opacity-10 animate-float-leaf-reverse">
        <svg viewBox="0 0 100 100" className="text-green-800">
          <path fill="currentColor" d="M50,0 C60,20 80,30 80,50 C80,70 60,80 50,100 C40,80 20,70 20,50 C20,30 40,20 50,0 Z"/>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#2a5c3e] mb-4 animate-fade-in-up">
            Why Choose CReATe Center
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-[#6a9f7d] to-[#8bc34a] mx-auto mb-6 rounded-full animate-scale-x"></div>
          <p className="text-lg text-[#4a6b57] max-w-3xl mx-auto animate-fade-in-up delay-100">
            Discover the advantages of working with our expert team and cutting-edge facilities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Benefit 1 - Technology */}
          <div className="benefit-card bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border border-[#e0e8e2] hover:border-[#c1d7c7] relative overflow-hidden group animate-fade-in-up delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f1f8f3]/30 to-[#e0efe5]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="icon-container bg-[#e8f3eb] w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:bg-[#d4e8da] transition-all duration-300 group-hover:rotate-6">
                <svg className="w-8 h-8 text-[#3a7d54] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center text-[#2a5c3e] mb-4 group-hover:text-[#1e3b2a] transition-colors duration-300">Cutting-Edge Technology</h3>
              <p className="text-[#4a6b57] text-center group-hover:text-[#3a5a47] transition-colors duration-300">
                Access to state-of-the-art equipment and the latest analytical tools for precise resource assessment and agricultural innovation.
              </p>
            </div>
          </div>

          {/* Benefit 2 - Experts */}
          <div className="benefit-card bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border border-[#e0e8e2] hover:border-[#c1d7c7] relative overflow-hidden group animate-fade-in-up delay-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f1f8f3]/30 to-[#e0efe5]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="icon-container bg-[#e8f3eb] w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:bg-[#d4e8da] transition-all duration-300 group-hover:-rotate-6">
                <svg className="w-8 h-8 text-[#3a7d54] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center text-[#2a5c3e] mb-4 group-hover:text-[#1e3b2a] transition-colors duration-300">Expert Guidance</h3>
              <p className="text-[#4a6b57] text-center group-hover:text-[#3a5a47] transition-colors duration-300">
                Work with our team of experienced researchers and agricultural engineers who provide practical, science-based solutions.
              </p>
            </div>
          </div>

          {/* Benefit 3 - Support */}
          <div className="benefit-card bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border border-[#e0e8e2] hover:border-[#c1d7c7] relative overflow-hidden group animate-fade-in-up delay-400">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f1f8f3]/30 to-[#e0efe5]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="icon-container bg-[#e8f3eb] w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:bg-[#d4e8da] transition-all duration-300 group-hover:rotate-3">
                <svg className="w-8 h-8 text-[#3a7d54] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center text-[#2a5c3e] mb-4 group-hover:text-[#1e3b2a] transition-colors duration-300">Comprehensive Support</h3>
              <p className="text-[#4a6b57] text-center group-hover:text-[#3a5a47] transition-colors duration-300">
                From initial consultation to implementation, we offer end-to-end support for your agricultural and resource management projects.
              </p>
            </div>
          </div>

          {/* Benefit 4 - Results */}
          <div className="benefit-card bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border border-[#e0e8e2] hover:border-[#c1d7c7] relative overflow-hidden group animate-fade-in-up delay-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f1f8f3]/30 to-[#e0efe5]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="icon-container bg-[#e8f3eb] w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:bg-[#d4e8da] transition-all duration-300 group-hover:-rotate-3">
                <svg className="w-8 h-8 text-[#3a7d54] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center text-[#2a5c3e] mb-4 group-hover:text-[#1e3b2a] transition-colors duration-300">Proven Results</h3>
              <p className="text-[#4a6b57] text-center group-hover:text-[#3a5a47] transition-colors duration-300">
                Our methods and technologies have been successfully implemented across the region, delivering measurable improvements in productivity.
              </p>
            </div>
          </div>

          {/* Benefit 5 - Security */}
          <div className="benefit-card bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border border-[#e0e8e2] hover:border-[#c1d7c7] relative overflow-hidden group animate-fade-in-up delay-600">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f1f8f3]/30 to-[#e0efe5]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="icon-container bg-[#e8f3eb] w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:bg-[#d4e8da] transition-all duration-300 group-hover:rotate-6">
                <svg className="w-8 h-8 text-[#3a7d54] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center text-[#2a5c3e] mb-4 group-hover:text-[#1e3b2a] transition-colors duration-300">Secure Data Handling</h3>
              <p className="text-[#4a6b57] text-center group-hover:text-[#3a5a47] transition-colors duration-300">
                We maintain strict confidentiality and data security protocols for all client projects and research data.
              </p>
            </div>
          </div>

          {/* Benefit 6 - Perspective */}
          <div className="benefit-card bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-2 border border-[#e0e8e2] hover:border-[#c1d7c7] relative overflow-hidden group animate-fade-in-up delay-700">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f1f8f3]/30 to-[#e0efe5]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="icon-container bg-[#e8f3eb] w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:bg-[#d4e8da] transition-all duration-300 group-hover:-rotate-6">
                <svg className="w-8 h-8 text-[#3a7d54] group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center text-[#2a5c3e] mb-4 group-hover:text-[#1e3b2a] transition-colors duration-300">Local & Global Perspective</h3>
              <p className="text-[#4a6b57] text-center group-hover:text-[#3a5a47] transition-colors duration-300">
                Combining local agricultural knowledge with international best practices to deliver customized solutions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2a5c3e] mb-4 animate-fade-in-up">Contact Us</h2>
            <div className="w-20 h-1 bg-green-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600">
              Schedule a consultation with our agricultural technology experts
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info Column */}
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Get in Touch</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 p-2 rounded-full mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Email</p>
                    <a href="mailto:create@carsu.edu.ph" className="text-green-600 hover:text-green-700 transition duration-300">
                      create@carsu.edu.ph
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 p-2 rounded-full mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Phone</p>
                    <a href="tel:09304529690" className="text-green-600 hover:text-green-700 transition duration-300">
                      09304529690
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 p-2 rounded-full mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Address</p>
                    <p className="text-gray-800">
                      CReATe Office, 2nd Floor Hinang Building, Caraga State University-Main Campus Ampayon, Butuan City, Agusan del Norte 8600
                    </p>
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
            </div>

            {/* Appointment Button Column */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-gray-50 p-8 rounded-xl shadow-sm w-full h-full flex flex-col items-center justify-center">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="relative overflow-hidden group bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl active:shadow-md active:scale-95 text-lg"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    Schedule an Appointment
                  </span>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                </button>
                <p className="mt-4 text-sm text-gray-500 text-center max-w-xs">
                  Get expert consultation in minutes with our agricultural specialists
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
{isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Overlay with green tint instead of black */}
    <div 
      className="absolute inset-0 bg-green-900/30 backdrop-blur-sm"
      onClick={() => {
        setIsModalOpen(false);
        setShowCalendarView(false);
      }}
    ></div>
    
    {/* Modal container */}
    <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-green-100">
      {/* Close button */}
      <button
        onClick={() => {
          setIsModalOpen(false);
          setShowCalendarView(false);
        }}
        className="absolute top-4 right-4 text-green-600 hover:text-green-800 transition-colors duration-300 p-1 rounded-full hover:bg-green-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <div className="p-8">
        <h2 className="text-2xl font-bold text-green-800 mb-6">Schedule an Appointment</h2>
        
        {isSubmitted ? (
          <div className="success-message bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg relative mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <span>Thank you for your message! We'll get back to you within 24 hours.</span>
            </div>
          </div>
        ) : showCalendarView ? (
          <div className="space-y-6">
            {/* Calendar View */}
            <div className="bg-white rounded-lg shadow-sm border border-green-100">
              <div className="flex items-center justify-between p-4 border-b border-green-100">
                <button 
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-full hover:bg-green-50 text-green-600 hover:text-green-800 transition-colors duration-300"
                >
                  &lt;
                </button>
                <h3 className="font-semibold text-green-800">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button 
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-full hover:bg-green-50 text-green-600 hover:text-green-800 transition-colors duration-300"
                >
                  &gt;
                </button>
              </div>
              
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 p-2 bg-green-50 rounded-t-lg">
                {['S', 'M', 'T', 'W', 'TH', 'F', 'ST'].map(day => (
                  <div key={day} className="text-center font-medium text-sm py-1 text-green-700">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 p-2">
                {renderCalendarDays()}
              </div>
            </div>

            {/* Time Slot Selection */}
            {appointmentDate && (
              <div className="border-t border-green-100 pt-6">
                <h3 className="font-semibold mb-4 flex items-center text-green-800">
                  <ClockIcon className="h-5 w-5 mr-2 text-green-600" />
                  Available times for {new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSlotSelect(time)}
                      className={`py-2 px-3 rounded-md text-sm border transition-colors duration-300
                        ${selectedTime === time 
                          ? 'bg-green-600 text-white border-green-600' 
                          : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
                        }
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>

                {selectedTime && (
                  <div className="mt-6">
                    <p className="text-sm mb-4 text-green-700">
                      Selected appointment: {new Date(appointmentDate).toLocaleDateString()} at {selectedTime}
                    </p>
                    <button
                      onClick={() => setShowCalendarView(false)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors duration-300"
                    >
                      Continue to Appointment Form
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-green-700 mb-1">Appointment Date & Time</label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="appointmentDate"
                  value={appointmentDate ? 
                    `${new Date(appointmentDate).toLocaleDateString()} at ${selectedTime || ''}` : 
                    'Not selected'}
                  readOnly
                  className="w-full px-4 py-3 border border-green-200 rounded-l-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300 bg-green-50 text-green-800"
                />
                <button
                  type="button"
                  onClick={() => setShowCalendarView(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-r-md transition duration-300 flex items-center justify-center"
                >
                  <CalendarIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-green-700 mb-2">I am a:</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-5 w-5 text-green-600 border-green-300 focus:ring-green-500"
                    name="userType"
                    value="student"
                    checked={userType === 'student'}
                    onChange={() => setUserType('student')}
                  />
                  <span className="ml-2 text-green-800">Student</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-5 w-5 text-green-600 border-green-300 focus:ring-green-500"
                    name="userType"
                    value="outsider"
                    checked={userType === 'outsider'}
                    onChange={() => setUserType('outsider')}
                  />
                  <span className="ml-2 text-green-800">Outsider</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name" className="block text-sm font-medium text-green-700 mb-1">Full Name</label>
              <input
                type="text"
                id="name"
                placeholder='e.g. Sada Haro'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-green-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300 bg-white text-green-800"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="block text-sm font-medium text-green-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                placeholder='e.g. sadaharo@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-green-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300 bg-white text-green-800"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="block text-sm font-medium text-green-700 mb-1">Phone Number</label>
              <input
                type="tel"
                id="phone"
                placeholder='e.g. 09123456789'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-green-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300 bg-white text-green-800"
                required
              />
            </div>

            {userType === 'student' && (
              <>
                <div className="form-group">
                  <label htmlFor="studentId" className="block text-sm font-medium text-green-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    id="studentId"
                    placeholder='e.g. 201-00000'
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-4 py-3 border border-green-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300 bg-white text-green-800"
                    required
                  />
                </div>

                      <div className="form-group">
                        <label htmlFor="department" className="block text-sm font-medium text-green-700 mb-1">Department</label>
                        <input
                          type="text"
                          id="department"
                          placeholder='e.g. College of Computing and Information Sciences'
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="course" className="block text-sm font-medium text-green-700 mb-1">Course</label>
                        <input
                          type="text"
                          id="course"
                          placeholder='e.g. Bachelor of Science in Information Technology'
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="year" className="block text-sm font-medium text-green-700 mb-1">Year Level</label>
                        <input
                          type="text"
                          id="year"
                          placeholder='1st Year'
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                          required
                        />
                      </div>
                    </>
                  )}

                  {userType === 'outsider' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="address" className="block text-sm font-medium text-green-700 mb-1">Address</label>
                        <input
                          type="text"
                          id="address"
                          placeholder='e.g. CReATe Office, 2nd Floor Hinang Building, Caraga State University-Main Campus Ampayon, Butuan City, Agusan del Norte 8600'
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="office" className="block text-sm font-medium text-green-700 mb-1">Office/Organization</label>
                        <input
                          type="text"
                          id="affiliation_or_office"
                          placeholder='e.g. Office of Admission and Scholarship'
                          value={affiliation_or_office}
                          onChange={(e) => setAffiliationOrOffice(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-300"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label htmlFor="message" className="block text-sm font-medium text-green-700 mb-1">Purpose of Consultation</label>
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
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                  disabled={isLoading || !appointmentDate}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    )}

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
                <li><a href="#about" className="text-gray-400 hover:text-green-400 transition duration-300">About Us</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-green-400 transition duration-300">Services</a></li>
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
        </div>
      </footer>
    </div>
  );
};

export default Home;