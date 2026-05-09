import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace fonts
html = html.replace(
    '<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">'
)
# Fallback if without rel=stylesheet
html = html.replace(
    '<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap"',
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"'
)

# Replace css link to include rjs-styles
if 'css/rjs-styles.css' not in html:
    html = html.replace(
        '<link rel="stylesheet" href="css/style.css">',
        '<link rel="stylesheet" href="css/style.css">\n  <link rel="stylesheet" href="css/rjs-styles.css">'
    )

# Replace title
html = html.replace(
    '<title>FORGE BUILDERS — We Build Legacies</title>',
    '<title>RJS HOMES - Building Dreams Since 2002</title>'
)
html = html.replace('FORGE BUILDERS', 'RJS HOMES')
html = html.replace('<div class="nav-logo-icon">F</div>', '<div class="nav-logo-icon">RJS</div>')
html = html.replace('<div class="login-logo-icon">F</div>', '<div class="login-logo-icon">RJS</div>')

homepage_start = html.find('<!-- ============================================\n       PAGE 1')
login_start = html.find('<!-- ============================================\n       PAGE 2')

new_homepage = """<!-- ============================================
       PAGE 1 - HOMEPAGE
       ============================================ -->
  <div class="page active" id="page-home">

    <!-- Navigation -->
    <nav class="main-nav" id="main-nav">
      <div class="nav-logo" onclick="navigateTo('home')">
        <div class="nav-logo-icon">RJS</div>
        <span class="nav-logo-text">RJS HOMES</span>
      </div>
      <ul class="nav-links" id="nav-links">
        <li><a href="#" onclick="navigateTo('home'); closeMenu();">HOME</a></li>
        <li><a href="#about-section" onclick="closeMenu();">ABOUT</a></li>
        <li><a href="#projects-section" onclick="closeMenu();">PROJECTS</a></li>
        <li><a href="#contact-section" onclick="closeMenu();">CONTACT</a></li>
        <li><a href="#" class="nav-cta" onclick="navigateTo('login'); closeMenu();">PORTAL &rarr;</a></li>
      </ul>
      <div class="nav-hamburger" id="nav-hamburger" onclick="toggleMenu()">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero rjs-hero" id="hero">
      <div class="hero-bg">
        <div class="hero-bg-animation"></div>
      </div>
      <div class="hero-content rjs-hero-content">
        <div class="hero-left">
          <div class="section-eyebrow animate-on-scroll">HYDERABAD'S PREMIUM REAL ESTATE</div>
          <h1 class="hero-title rjs-title animate-on-scroll stagger-1">
            Building Dreams<br><span class="gold">Since 2002</span>
          </h1>
          <p class="hero-subtitle rjs-subtitle animate-on-scroll stagger-2">
            From our father's legacy of craftsmanship to a fully transparent, technology-driven real estate experience - RJS Homes is your trusted partner for premium homes in Hyderabad.
          </p>
          <div class="hero-buttons animate-on-scroll stagger-3">
            <button class="btn btn-gold rjs-btn" onclick="scrollToSection('projects-section')">
              VIEW OUR PROJECTS
            </button>
            <button class="btn btn-outline rjs-btn" onclick="scrollToSection('about-section')">
              OUR STORY
            </button>
          </div>
        </div>
        <div class="hero-right animate-on-scroll stagger-4">
          <div class="vertical-stats">
            <div class="v-stat">
              <div class="v-stat-num"><span class="counter" data-target="20">0</span>+</div>
              <div class="v-stat-label">YEARS</div>
            </div>
            <div class="v-stat-divider"></div>
            <div class="v-stat">
              <div class="v-stat-num"><span class="counter" data-target="500">0</span>+</div>
              <div class="v-stat-label">FAMILIES</div>
            </div>
            <div class="v-stat-divider"></div>
            <div class="v-stat">
              <div class="v-stat-num"><span class="counter" data-target="50">0</span>+</div>
              <div class="v-stat-label">PROJECTS</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about-section" id="about-section">
      <div class="horizontal-stats animate-on-scroll" id="stats-section">
        <div class="h-stat">
          <div class="h-stat-num"><span class="counter" data-target="20">0</span>+</div>
          <div class="h-stat-label">YEARS OF EXPERIENCE</div>
        </div>
        <div class="h-stat">
          <div class="h-stat-num"><span class="counter" data-target="500">0</span>+</div>
          <div class="h-stat-label">HAPPY FAMILIES</div>
        </div>
        <div class="h-stat">
          <div class="h-stat-num"><span class="counter" data-target="50">0</span>+</div>
          <div class="h-stat-label">PROJECTS DELIVERED</div>
        </div>
        <div class="h-stat">
          <div class="h-stat-num"><span class="counter" data-target="100">0</span>%</div>
          <div class="h-stat-label">TRANSPARENT PROCESS</div>
        </div>
      </div>

      <div class="about-content">
        <div class="about-left animate-on-scroll">
          <div class="about-image-container">
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop" alt="Raman Jee Sharma" class="about-img">
            <div class="about-img-caption">
              <h3>Raman Jee Sharma</h3>
              <p>Founder & Director, RJS Homes</p>
            </div>
          </div>
        </div>
        <div class="about-right animate-on-scroll stagger-2">
          <div class="section-eyebrow">OUR STORY</div>
          <h2 class="section-title rjs-title">From My Father's Workshop<br>to Your Dream Home</h2>
          
          <blockquote class="rjs-quote">
            "I watched my father build something extraordinary - not just buildings, but trust. I wanted to carry that forward, and make it transparent."
          </blockquote>
          
          <div class="rjs-text">
            <p>Growing up in Hyderabad, I had a front-row seat to my father's furniture contracting business - a venture he poured his life into since <strong>2002</strong>. He worked tirelessly across the city, delivering quality craftsmanship job after job. But I noticed something that quietly troubled me: clients rarely had full visibility into what was happening with their investment. Timelines shifted, costs weren't always explained, and trust was fragile.</p>
            
            <p>That gap - between what was promised and what clients could verify - became the mission I built RJS Homes around. When I stepped into the business, I brought a new philosophy: <strong>complete transparency, documented at every step.</strong></p>
            
            <p>Today, RJS Homes is a bridge between two generations. We carry forward two decades of on-ground expertise, trusted supplier relationships, and a reputation for quality - while layering on modern digital tools that give you real-time visibility into every rupee, every milestone, and every decision. From floor plan to final handover, you'll always know exactly where your home stands.</p>
            
            <p class="rjs-bold">This isn't just real estate. It's your family's future - and we take that seriously.</p>
          </div>

          <div class="rjs-tags">
            <span class="rjs-tag">TRANSPARENCY</span>
            <span class="rjs-tag">QUALITY</span>
            <span class="rjs-tag">LEGACY</span>
            <span class="rjs-tag">INNOVATION</span>
          </div>

          <div class="hero-buttons">
            <button class="btn btn-gold rjs-btn" onclick="scrollToSection('projects-section')">EXPLORE PROJECTS</button>
            <button class="btn btn-outline rjs-btn" onclick="scrollToSection('contact-section')">GET IN TOUCH</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section class="projects-section rjs-projects" id="projects-section">
      <div class="projects-header animate-on-scroll">
        <div>
          <div class="section-eyebrow">OUR PORTFOLIO</div>
          <h2 class="section-title rjs-title">Featured Projects</h2>
        </div>
        <a href="#" class="view-all-link">View All &rarr;</a>
      </div>
      
      <div class="projects-tabs animate-on-scroll">
        <button class="tab-btn active">ALL</button>
        <button class="tab-btn">VILLAS</button>
        <button class="tab-btn">APARTMENTS</button>
        <button class="tab-btn">DUPLEXES</button>
        <button class="tab-btn">COMMERCIAL</button>
      </div>

      <div class="rjs-projects-grid">
        <!-- Card 1 -->
        <div class="rjs-card border-yellow animate-on-scroll stagger-1">
          <div class="rjs-card-img">
            <span>VILLA ARECA - JUBILEE HILLS</span>
          </div>
          <div class="rjs-card-content">
            <h3>Villa Areca</h3>
            <p class="rjs-card-meta">Jubilee Hills, Hyderabad · Villa · 24 Units</p>
            <p class="rjs-card-price">₹85L - ₹1.2 Cr</p>
            <div class="rjs-card-footer">
              <span class="rjs-status status-active">ACTIVE</span>
              <a href="#" class="rjs-details-link">Details &rarr;</a>
            </div>
          </div>
        </div>
        
        <!-- Card 2 -->
        <div class="rjs-card border-blue animate-on-scroll stagger-2">
          <div class="rjs-card-img">
            <span>SKYLINE BLOCK A - GACHIBOWLI</span>
          </div>
          <div class="rjs-card-content">
            <h3>Skyline Block A</h3>
            <p class="rjs-card-meta">Gachibowli, Hyderabad · Apartment · 120 Units</p>
            <p class="rjs-card-price">₹45L - ₹75L</p>
            <div class="rjs-card-footer">
              <span class="rjs-status status-active">ACTIVE</span>
              <a href="#" class="rjs-details-link">Details &rarr;</a>
            </div>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="rjs-card border-orange animate-on-scroll stagger-3">
          <div class="rjs-card-img">
            <span>DUPLEX ROW PHASE 1 - KOMPALLY</span>
          </div>
          <div class="rjs-card-content">
            <h3>Duplex Row Ph.1</h3>
            <p class="rjs-card-meta">Kompally, Hyderabad · Duplex · 36 Units</p>
            <p class="rjs-card-price">₹65L - ₹90L</p>
            <div class="rjs-card-footer">
              <span class="rjs-status status-ongoing">ONGOING</span>
              <a href="#" class="rjs-details-link">Details &rarr;</a>
            </div>
          </div>
        </div>

        <!-- Card 4 -->
        <div class="rjs-card border-green animate-on-scroll stagger-4">
          <div class="rjs-card-img">
            <span>GREEN MEADOWS - SHAMIRPET</span>
          </div>
          <div class="rjs-card-content">
            <h3>Green Meadows</h3>
            <p class="rjs-card-meta">Shamirpet, Hyderabad · Villa · 48 Units</p>
            <p class="rjs-card-price">₹1.1 Cr - ₹1.8 Cr</p>
            <div class="rjs-card-footer">
              <span class="rjs-status status-new">NEW LAUNCH</span>
              <a href="#" class="rjs-details-link">Details &rarr;</a>
            </div>
          </div>
        </div>

        <!-- Card 5 -->
        <div class="rjs-card border-red animate-on-scroll stagger-5">
          <div class="rjs-card-img">
            <span>COMMERCIAL HUB - HITEC CITY</span>
          </div>
          <div class="rjs-card-content">
            <h3>Commercial Hub</h3>
            <p class="rjs-card-meta">HITEC City, Hyderabad · Commercial · 18 Units</p>
            <p class="rjs-card-price">₹1.5 Cr - ₹3 Cr</p>
            <div class="rjs-card-footer">
              <span class="rjs-status status-completed">COMPLETED</span>
              <a href="#" class="rjs-details-link">Details &rarr;</a>
            </div>
          </div>
        </div>

        <!-- Card 6 -->
        <div class="rjs-card border-blue animate-on-scroll stagger-6">
          <div class="rjs-card-img">
            <span>EMERALD HEIGHTS - MIYAPUR</span>
          </div>
          <div class="rjs-card-content">
            <h3>Emerald Heights</h3>
            <p class="rjs-card-meta">Miyapur, Hyderabad · Apartment · 96 Units</p>
            <p class="rjs-card-price">₹38L - ₹62L</p>
            <div class="rjs-card-footer">
              <span class="rjs-status status-new">NEW LAUNCH</span>
              <a href="#" class="rjs-details-link">Details &rarr;</a>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Contact Section -->
    <section class="contact-section rjs-contact" id="contact-section">
      <div class="contact-header animate-on-scroll">
        <div class="section-eyebrow">GET IN TOUCH</div>
        <h2 class="section-title rjs-title">Let's Build Your Dream<br>Together</h2>
        <p class="contact-subtitle">We respond within 24 hours. No middlemen, no call centres - just real people who care about your home.</p>
      </div>
      
      <div class="contact-grid">
        <div class="rjs-form-box animate-on-scroll">
          <h3>Send Us a Message</h3>
          <form class="rjs-form">
            <div class="rjs-form-group">
              <label>FULL NAME</label>
              <input type="text" placeholder="Your full name">
            </div>
            <!-- Additional fields can go here -->
          </form>
        </div>
        <div class="contact-info-container animate-on-scroll stagger-2">
          <div class="contact-info-card">
            <div class="info-icon">📍</div>
            <div class="info-details">
              <h4>OFFICE ADDRESS</h4>
              <p>Plot 42, Road 12, Jubilee Hills<br>Hyderabad, Telangana 500033</p>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>

  """

html = html[:homepage_start] + new_homepage + html[login_start:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
