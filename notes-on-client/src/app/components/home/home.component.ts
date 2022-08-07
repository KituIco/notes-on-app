import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  title = 'NotesOn';
  logo = 'http://localhost:3000/static/images/notion-logo.png';

  navItems = [{
    path: '/#connect',
    name: 'Connect'
  },
  {
    path: '/#contextualize',
    name: 'Contextualize'
  },
  {
    path: '/#customize',
    name: 'Customize'
  }]
  
  navButtons = [{
    path: '/signup',
    name: 'Get started now',
    size: 8,
    design: 'primary',
  },
  {
    path: '/login',
    name: 'Log in',
    size: 4,
    design: "secondary",
  }]

  cSections = [{
    id: "connect",
    img: "http://localhost:3000/static/images/spot-connect.webp",
    title: "Team up without the chaos",
    subtitle: "Connect your teams, projects, and docs in NotesOn — so you can bust silos and move as one.",
    screenshot: "http://localhost:3000/static/images/noteson-one.png"
  },
  {
    id: "contextualize",
    img: "http://localhost:3000/static/images/spot-contextualize.webp",
    title: "Never ask “What’s the context?” again",
    subtitle: "Stale wikis aren't helpful. Neither are floating docs. In NotesOn, your work and knowledge live side by side — so you never lose context.",
    screenshot: "http://localhost:3000/static/images/noteson-two.png"
  },
  {
    id: "customize",
    img: "http://localhost:3000/static/images/spot-customize.png",
    title: "Build the workflow you want",
    subtitle: "Customize NotesOn to make it work the way you want it to. Just drag and drop to craft the dashboard, website, doc, or system you need.",
    screenshot: "http://localhost:3000/static/images/noteson-three.png"
  }]

}

