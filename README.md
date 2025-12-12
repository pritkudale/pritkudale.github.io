# Pritam Kudale - Portfolio Website

A modern, responsive portfolio website built with HTML, CSS, and JavaScript.

## 🌐 Live Demo

Visit: [pritamkudale.github.io](https://pritamkudale.github.io)

## ✨ Features

- **Modern Design**: Clean and attractive UI with gradient accents
- **Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Typing effect, scroll animations, and hover effects
- **Interactive Elements**: Animated skill bars, statistics counter, and form validation
- **Dark Theme**: Easy on the eyes with a professional dark color scheme

## 🛠️ Technologies Used

- HTML5
- CSS3 (with CSS Variables, Flexbox, Grid)
- Vanilla JavaScript
- Font Awesome Icons
- Google Fonts (Poppins, Fira Code)

## 📁 Project Structure

```
pritamkudale/
├── index.html      # Main HTML file
├── styles.css      # All styles
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## 🚀 Deployment to GitHub Pages

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Portfolio website"
   git branch -M main
   git remote add origin https://github.com/pritamkudale/pritamkudale.github.io.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "Deploy from a branch"
   - Select "main" branch and "/ (root)" folder
   - Click Save

3. Your site will be live at `https://pritamkudale.github.io` within a few minutes!

## ✏️ Customization

### Personal Information
Edit `index.html` to update:
- Your name and title
- About me section content
- Contact information (email, phone, location)
- Social media links

### Skills
Modify the skills section in `index.html` to match your expertise. Update the `data-progress` attribute to set skill levels.

### Projects
Replace the placeholder projects with your actual work. Update:
- Project titles and descriptions
- Technology tags
- Live demo and GitHub links
- Project images (replace the placeholders)

### Colors
Customize the color scheme in `styles.css` by modifying the CSS variables at the top:
```css
:root {
    --primary-color: #6c63ff;
    --secondary-color: #f50057;
    /* ... other variables */
}
```

## 📧 Contact Form

The contact form currently shows an alert on submission. To make it functional, you can:

1. **Use Formspree**: Add your Formspree endpoint to the form action
2. **Use Netlify Forms**: Add `netlify` attribute to the form if hosting on Netlify
3. **Custom Backend**: Connect to your own backend API

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Made with ❤️ by Pritam Kudale
