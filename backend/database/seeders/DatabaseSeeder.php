<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Course;
use App\Models\Module;
use App\Models\Enrollment;
use App\Models\Comment;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Users ─────────────────────────────────────────────
        $instructor = User::create([
            'name'     => 'Marwane',
            'email'    => 'Marwane@MR1Academy.com',
            'password' => Hash::make('123Marwane456!'),
            'is_admin' => true,
        ]);

        $instructor2 = User::create([
            'name'     => 'Thomas Dubois',
            'email'    => 'thomas@MR1Academy.com',
            'password' => Hash::make('password'),
        ]);

        $student = User::create([
            'name'     => 'Alexandre Dupont',
            'email'    => 'alex@example.com',
            'password' => Hash::make('password'),
        ]);

        // ── Courses ───────────────────────────────────────────
        $courses = [
            [
                'title'       => 'Maitrise de React JS & Animations Modernes',
                'description' => 'Apprenez React JS de zéro à expert : hooks, state management, animations Framer Motion et connexion avec une API REST.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.9,
                'students'    => 12000,
                'modules'     => [
                    ["Introduction à l'Architecture Web",  '10:24', 'https://www.youtube.com/watch?v=SqcY0GlETPk'],
                    ['Configuration du Projet React',       '15:38', 'https://www.youtube.com/watch?v=O6P86uwfdR0'],
                    ['Hooks et State Management',           '24:15', 'https://www.youtube.com/watch?v=Ke90Tje7VS0'],
                    ['Animations avec Framer Motion',       '18:42', 'https://www.youtube.com/watch?v=znbCa4Rr054'],
                    ['Connexion à une API Laravel',         '32:10', 'https://www.youtube.com/watch?v=LRE0fL-d2o8'],
                ],
            ],
            [
                'title'       => 'Laravel 11: Architecture Backend Complète',
                'description' => 'Maîtrisez Laravel 11 pour construire des APIs REST robustes, avec Sanctum, Eloquent ORM, migrations et déploiement.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.8,
                'students'    => 8500,
                'modules'     => [
                    ['Installation & Configuration Laravel', '08:20', 'https://www.youtube.com/watch?v=MT-GJISB3Bg'],
                    ['Architecture MVC expliquée',           '12:45', 'https://www.youtube.com/watch?v=TzAJfjCn7Ks'],
                    ['Création de l\'API REST',               '22:30', 'https://www.youtube.com/watch?v=fXv3fP4Z1yM'],
                    ['Authentification Sanctum',              '28:15', 'https://www.youtube.com/watch?v=XML9w-ENvzw'],
                    ['Déploiement sur VPS Ubuntu',           '34:00', 'https://www.youtube.com/watch?v=XML9w-ENvzw'],
                ],
            ],
            [
                'title'       => 'UI/UX Masterclass: Du Wireframe au Prototype',
                'description' => 'Créez des designs professionnels avec Figma. De la recherche utilisateur au prototype interactif haute fidélité.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 5.0,
                'students'    => 24000,
                'modules'     => [
                    ['Fondamentaux du Design UX',           '14:00', 'https://www.youtube.com/watch?v=SRec90j6lTY'],
                    ['Wireframing avec Figma',              '20:15', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8'],
                    ['Design System & Composants',          '18:30', 'https://www.youtube.com/watch?v=Dtd40cHQQlk'],
                    ['Prototype Interactif',                '22:45', 'https://www.youtube.com/watch?v=lTTajzrSkCw'],
                    ['Présenter à un client',               '10:00', 'https://www.youtube.com/watch?v=6T_HgnjoYwM'],
                ],
            ],
            [
                'title'       => 'Python pour la Data Science & Machine Learning',
                'description' => 'Maîtrisez Python, Pandas, NumPy, Matplotlib et les algorithmes ML avec scikit-learn pour analyser des données réelles.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.9,
                'students'    => 18500,
                'modules'     => [
                    ['Introduction au Python Moderne',      '12:00', 'https://www.youtube.com/watch?v=kqtD5dpn9C8'],
                    ['NumPy & Pandas pour la Data',         '25:30', 'https://www.youtube.com/watch?v=vmEHCJofslg'],
                    ['Visualisation avec Matplotlib',       '20:00', 'https://www.youtube.com/watch?v=3Xc3CA655Y4'],
                    ['Machine Learning avec Scikit-learn',  '35:45', 'https://www.youtube.com/watch?v=pqNCD_5r0IU'],
                    ['Projet Final: Prédiction de Prix',    '45:00', 'https://www.youtube.com/watch?v=fwY9Qv96DJY'],
                ],
            ],
            [
                'title'       => 'Node.js & Express: API REST Complète',
                'description' => 'Construisez des APIs performantes avec Node.js, Express, MongoDB et déployez sur le cloud avec Docker et CI/CD.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.7,
                'students'    => 9200,
                'modules'     => [
                    ['Node.js: Architecture et Event Loop', '16:00', 'https://www.youtube.com/watch?v=ENrzD9HAZK4'],
                    ['Express.js et Routing avancé',        '22:30', 'https://www.youtube.com/watch?v=Lr9WUkeYSA8'],
                    ['MongoDB & Mongoose',                  '28:00', 'https://www.youtube.com/watch?v=DZBGEVgL2eE'],
                    ['Authentification JWT',                '32:15', 'https://www.youtube.com/watch?v=7Q17ubqLfaM'],
                    ['Dockeriser & Déployer l\'API',         '40:00', 'https://www.youtube.com/watch?v=pOZFqQQOAFQ'],
                ],
            ],
            [
                'title'       => 'CSS Glassmorphism & Design Avancé',
                'description' => 'Maîtrisez les techniques CSS modernes: Grid, Flexbox, variables CSS, animations, Glassmorphism et Dark Mode professionnel.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.8,
                'students'    => 15200,
                'modules'     => [
                    ['CSS Grid & Flexbox Avancés',          '18:00', 'https://www.youtube.com/watch?v=jV8B24rSN5o'],
                    ['Variables CSS & Design Tokens',       '14:30', 'https://www.youtube.com/watch?v=oZPR_78wCnY'],
                    ['Glassmorphism de A à Z',              '22:00', 'https://www.youtube.com/watch?v=RIWTs4U6Cto'],
                    ['Animations CSS & Keyframes',          '26:45', 'https://www.youtube.com/watch?v=YszONjKpgg4'],
                    ['Dark Mode & Thèmes Dynamiques',       '20:00', 'https://www.youtube.com/watch?v=9EPTBX2Ogz0'],
                ],
            ],
            [
                'title'       => 'Oracle Database 21c Administration',
                'description' => 'Devenez DBA expert : administration, sauvegarde, sécurité, SQL et PL/SQL.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.7,
                'students'    => 5400,
                'modules'     => [
                    ['Introduction à Oracle Database', '15:20', 'https://www.youtube.com/watch?v=wG6z3Kg8Ep4'],
                    ['SQL Fondamental : SELECT, JOIN, GROUP BY', '30:10', 'https://www.youtube.com/watch?v=7S_tz1z_5bA'],
                    ['PL/SQL : Procédures et Fonctions', '28:00', 'https://www.youtube.com/watch?v=t1Bt0LFaIXw'],
                    ['Administration et Sauvegarde', '35:45', 'https://www.youtube.com/watch?v=h0nxCDiD-zg'],
                ],
            ],
            [
                'title'       => 'Développement Web avec .NET 8',
                'description' => 'Construisez des applications robustes avec ASP.NET Core MVC, Web API et Entity Framework.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.9,
                'students'    => 11200,
                'modules'     => [
                    ['Introduction à ASP.NET Core 8', '20:00', 'https://www.youtube.com/watch?v=ravLFzIGuCM'],
                    ['MVC Pattern et Razor Pages', '30:15', 'https://www.youtube.com/watch?v=pTB0EiLXUC8'],
                    ['Entity Framework Core et Migrations', '35:45', 'https://www.youtube.com/watch?v=fmvcAzHpsk8'],
                    ['Web API REST et Authentication', '42:00', 'https://www.youtube.com/watch?v=yClSNpoj-kQ'],
                ],
            ],
            [
                'title'       => 'Développeur Java Enterprise (Spring Boot)',
                'description' => 'Maîtrisez Java 21, Spring Boot, Spring Security et les micro-services orientés cloud.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1629853925769-6d60cbee83b0?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.8,
                'students'    => 20500,
                'modules'     => [
                    ['Fondamentaux de Java 21', '18:30', 'https://www.youtube.com/watch?v=eIrMbAQSU34'],
                    ['Spring Boot : Configuration et Démarrage', '28:15', 'https://www.youtube.com/watch?v=9SGDpanrc8U'],
                    ['Spring Data JPA et Repositories', '35:00', 'https://www.youtube.com/watch?v=Zs342ePFvRI'],
                    ['Spring Security et JWT', '40:20', 'https://www.youtube.com/watch?v=IUqKuGNasdM'],
                    ['Micro-services et Docker', '45:00', 'https://www.youtube.com/watch?v=drQK8ciCAjY'],
                ],
            ],
            [
                'title'       => 'Programmation en C pour les Débutants',
                'description' => 'Apprenez les bases de la programmation système, les pointeurs, et la gestion de mémoire en C.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.6,
                'students'    => 4000,
                'modules'     => [
                    ['Introduction au Langage C', '22:15', 'https://www.youtube.com/watch?v=KJgsSFOSQv0'],
                    ['Variables, Boucles et Conditions', '30:00', 'https://www.youtube.com/watch?v=aZb0iu4AZXY'],
                    ['Pointeurs et Tableaux', '35:20', 'https://www.youtube.com/watch?v=zuegQmMdy8M'],
                    ['Gestion de la Mémoire Dynamique', '40:00', 'https://www.youtube.com/watch?v=ix5jPkxsr7M'],
                ],
            ],
            [
                'title'       => 'C# Moderne de A à Z',
                'description' => 'Découvrez C# 12, LINQ, l\'asynchrone, et les bonnes pratiques de programmation orientée objet.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.9,
                'students'    => 13800,
                'modules'     => [
                    ['Introduction à C# 12', '25:00', 'https://www.youtube.com/watch?v=ravLFzIGuCM'],
                    ['Programmation Orientée Objet en C#', '32:30', 'https://www.youtube.com/watch?v=pTB0EiLXUC8'],
                    ['LINQ et Collections Avancées', '28:15', 'https://www.youtube.com/watch?v=yClSNpoj-kQ'],
                    ['Programmation Asynchrone (async/await)', '35:00', 'https://www.youtube.com/watch?v=fmvcAzHpsk8'],
                ],
            ],
            [
                'title'       => 'C++ Haute Performance',
                'description' => 'Domptez C++20, les templates, et la conception logicielle pour les jeux, la finance et l\'embarqué.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.8,
                'students'    => 8600,
                'modules'     => [
                    ['C++20 : Nouveautés et Concepts', '28:40', 'https://www.youtube.com/watch?v=vLnPwxZdW4Y'],
                    ['STL et Algorithmes Optimisés', '35:00', 'https://www.youtube.com/watch?v=LMXjMmuNiJQ'],
                    ['Templates et Programmation Générique', '42:15', 'https://www.youtube.com/watch?v=I-hZkUa9mIs'],
                    ['Multithreading et Concurrence', '45:10', 'https://www.youtube.com/watch?v=UOB7-B2MfwA'],
                ],
            ],
            [
                'title'       => 'Ingénierie IA Générative : LLMs, RAG & Agents Autonomes',
                'description' => 'Maîtrisez les Large Language Models (OpenAI, Claude, Llama 3), l\'architecture RAG avec bases vectorielles, LangChain et la création d\'agents IA autonomes en production.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 5.0,
                'students'    => 31400,
                'modules'     => [
                    ['Architecture des Transformers, Tokens & Embeddings', '18:20', 'https://www.youtube.com/watch?v=aircAruvnKk'],
                    ['Prompt Engineering Avancé & Function Calling JSON', '22:15', 'https://www.youtube.com/watch?v=_ZvnD96BsQo'],
                    ['Pipeline RAG Complet : Chunking, Pinecone & ChromaDB', '29:40', 'https://www.youtube.com/watch?v=T-D1OfcDW1M'],
                    ['Orchestration d\'Agents Autonomes avec LangChain & LangGraph', '34:10', 'https://www.youtube.com/watch?v=aywZrzNaKjs'],
                    ['Fine-Tuning LoRA / QLoRA & Évaluation des LLMs en Production', '38:00', 'https://www.youtube.com/watch?v=eC6Hd1hFvos'],
                ],
            ],
            [
                'title'       => 'Deep Learning & Computer Vision avec PyTorch',
                'description' => 'Construisez et entraînez des réseaux de neurones profonds (CNN, Vision Transformers, YOLO) avec PyTorch et accélération GPU CUDA.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.9,
                'students'    => 19800,
                'modules'     => [
                    ['Tenseurs PyTorch, Autograd & Descente de Gradient', '20:10', 'https://www.youtube.com/watch?v=V_xro1bcAuA'],
                    ['Réseaux de Neurones Multicouches (MLP) & Fonctions d\'Activation', '24:35', 'https://www.youtube.com/watch?v=IHZwWFHWa-w'],
                    ['Computer Vision : Réseaux Convolutifs (CNN) & ResNet', '31:15', 'https://www.youtube.com/watch?v=YRhxdVk_sIs'],
                    ['Détection d\'Objets Temps Réel & Segmentation d\'Images', '28:50', 'https://www.youtube.com/watch?v=ag3DLKsl2vk'],
                    ['Déploiement de Modèles IA avec FastAPI & ONNX Runtime', '26:30', 'https://www.youtube.com/watch?v=0RS9W8MtZe4'],
                ],
            ],
            [
                'title'       => 'Data Engineering : Apache Spark, Kafka & Pipelines Big Data',
                'description' => 'Concevez des architectures Data Lakehouse modernes : ingestion temps réel avec Apache Kafka, traitement distribué PySpark, Airflow et DBT.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.9,
                'students'    => 16400,
                'modules'     => [
                    ['Architecture Data Moderne : Data Warehouse vs Data Lakehouse', '16:45', 'https://www.youtube.com/watch?v=qWru-b6m030'],
                    ['Traitement Distribué Big Data avec Apache Spark & PySpark', '32:20', 'https://www.youtube.com/watch?v=_C8kWso4ne4'],
                    ['Streaming d\'Événements Temps Réel avec Apache Kafka', '28:15', 'https://www.youtube.com/watch?v=uvb00oaa3k8'],
                    ['Orchestration de Pipelines ETL avec Apache Airflow', '25:40', 'https://www.youtube.com/watch?v=K9AnJ9_ZAXE'],
                    ['Modélisation Analytique avec DBT & Optimisation Parquet', '30:00', 'https://www.youtube.com/watch?v=5rNquRnNb4E'],
                ],
            ],
            [
                'title'       => 'Data Analytics, Power BI, DAX & Storytelling Décisionnel',
                'description' => 'Transformez des millions de lignes de données brutes en tableaux de bord exécutifs interactifs avec Power BI, DAX avancé, Power Query et SQL analytique.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.8,
                'students'    => 22100,
                'modules'     => [
                    ['Nettoyage & Transformation ETL avec Power Query', '19:15', 'https://www.youtube.com/watch?v=NNSHu0rkew8'],
                    ['Modélisation en Étoile (Star Schema) & Relations', '21:30', 'https://www.youtube.com/watch?v=T7bf21kP2_U'],
                    ['Maîtrise du Langage DAX : CALCULATE, Time Intelligence & KPIs', '33:10', 'https://www.youtube.com/watch?v=GHc6224efxI'],
                    ['Design de Dashboards Exécutifs & Data Storytelling', '24:00', 'https://www.youtube.com/watch?v=3u7MQz1EyPY'],
                    ['Publication Cloud, Sécurité par Ligne (RLS) & Automatisation', '18:45', 'https://www.youtube.com/watch?v=yKTSLffVGbk'],
                ],
            ],
            [
                'title'       => 'DevOps Cloud Native : Docker, Kubernetes, Terraform & CI/CD',
                'description' => 'Automatisez vos infrastructures cloud de A à Z : conteneurisation Docker multi-stage, clusters Kubernetes (EKS/GKE), Infrastructure as Code Terraform et GitHub Actions.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.9,
                'students'    => 25300,
                'modules'     => [
                    ['Docker Avancé : Multi-Stage Builds, Réseaux & Volumes', '23:10', 'https://www.youtube.com/watch?v=3c-iBn73dDE'],
                    ['Architecture Kubernetes : Pods, Deployments, Services & Ingress', '36:40', 'https://www.youtube.com/watch?v=X48VuDVv0do'],
                    ['Infrastructure as Code (IaC) sur AWS avec Terraform', '29:15', 'https://www.youtube.com/watch?v=SLB_c_ayRMo'],
                    ['Pipelines CI/CD Automatisés avec GitHub Actions & ArgoCD', '27:30', 'https://www.youtube.com/watch?v=R8_veQiYBjI'],
                    ['Observabilité : Monitoring Prometheus, Grafana & Alerting', '24:20', 'https://www.youtube.com/watch?v=h4Sl21AKiDg'],
                ],
            ],
            [
                'title'       => 'Cybersécurité Offensive : Ethical Hacking, Pentest & OWASP',
                'description' => 'Apprenez à sécuriser les applications web et réseaux : méthodologie Pentest, Top 10 OWASP, cryptographie, analyse réseau Wireshark et défense Zero-Trust.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.9,
                'students'    => 27900,
                'modules'     => [
                    ['Reconnaissance, Scanning Réseau Nmap & Analyse Wireshark', '21:40', 'https://www.youtube.com/watch?v=3Kq1MIfTWCE'],
                    ['Top 10 OWASP : Injections SQL, XSS & CSRF en Pratique', '34:15', 'https://www.youtube.com/watch?v=rWHvp7rUka8'],
                    ['Sécurité des APIs REST, JWT, OAuth2 & Gestion des Secrets', '26:50', 'https://www.youtube.com/watch?v=7Q17ubqLfaM'],
                    ['Cryptographie Moderne : Hachage Argon2, TLS 1.3 & Clés RSA/ECC', '23:20', 'https://www.youtube.com/watch?v=jhXCTbFnK8o'],
                    ['Audit de Code, Hardening Linux & Architecture Zero-Trust', '29:00', 'https://www.youtube.com/watch?v=fNzpcB7ODxQ'],
                ],
            ],
            [
                'title'       => 'Next.js 15 & TypeScript 5 : Architecture SaaS Full-Stack',
                'description' => 'Développez des applications web ultra-rapides avec Next.js App Router, React Server Components, TypeScript strict, Prisma ORM et Tailwind CSS.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 5.0,
                'students'    => 26800,
                'modules'     => [
                    ['TypeScript 5 Strict : Generics, Utility Types & Inférence Zod', '22:00', 'https://www.youtube.com/watch?v=d56mG7DezGs'],
                    ['Next.js 15 App Router : Server Components & Streaming SSR', '28:30', 'https://www.youtube.com/watch?v=ZVnjOPwW4ZA'],
                    ['Server Actions, Mutations Sécurisées & Optimistic UI', '25:15', 'https://www.youtube.com/watch?v=dDpZfOQBMaU'],
                    ['Base de Données Type-Safe avec Prisma ORM & PostgreSQL', '31:00', 'https://www.youtube.com/watch?v=RebA5J-rlwg'],
                    ['Mise en Production Edge, Cache ISR & Optimisation Core Web Vitals', '24:40', 'https://www.youtube.com/watch?v=8aGhZQkoFbQ'],
                ],
            ],
            [
                'title'       => 'Flutter 3 & Dart : Applications Mobiles iOS & Android Pro',
                'description' => 'Créez des applications mobiles natives compilées à 120 FPS pour iOS et Android avec une seule base de code Flutter, Riverpod, animations fluides et API REST.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.8,
                'students'    => 17500,
                'modules'     => [
                    ['Langage Dart 3 : Null Safety, Async/Streams & Classes Scellées', '19:30', 'https://www.youtube.com/watch?v=Ej_Pcr4uC2Q'],
                    ['Architecture Widget Tree, Layouts Responsive & Material 3', '26:15', 'https://www.youtube.com/watch?v=VPvVD8t02U8'],
                    ['State Management Réactif à Grande Échelle avec Riverpod / Bloc', '32:00', 'https://www.youtube.com/watch?v=7dAt-JMSCVQ'],
                    ['Animations Implicites, Hero Transitions & CustomPainter', '24:45', 'https://www.youtube.com/watch?v=OtrWXLfGtqE'],
                    ['Stockage Local, Notifications Push & Publication App Store / Play Store', '28:20', 'https://www.youtube.com/watch?v=x0uinJvhNxI'],
                ],
            ],
            [
                'title'       => 'Programmation Système & Web Haute Performance avec Rust',
                'description' => 'Maîtrisez le langage le plus aimé des développeurs : Ownership, Borrow Checker, zéro Garbage Collector, concurrence sans data-race et WebAssembly.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.9,
                'students'    => 14200,
                'modules'     => [
                    ['Fondamentaux de Rust : Cargo, Immutabilité & Pattern Matching', '21:10', 'https://www.youtube.com/watch?v=BpPEoZW5IiY'],
                    ['Comprendre l\'Ownership, le Borrowing & les Lifetimes', '33:45', 'https://www.youtube.com/watch?v=VFIOSWy93H0'],
                    ['Traits, Generics & Gestion d\'Erreurs Robuste (Result / Option)', '27:30', 'https://www.youtube.com/watch?v=zF34dRivLOw'],
                    ['Concurrence Asynchrone Ultra-Rapide avec Tokio & Actix-Web', '35:15', 'https://www.youtube.com/watch?v=4DqP57BHaXI'],
                ],
            ],
            [
                'title'       => 'Go (Golang) : Microservices Concurrents, gRPC & Cloud',
                'description' => 'Développez des backends ultra-scalables en Go : Goroutines, Channels, APIs HTTP/gRPC haute fréquence et architecture hexagonale.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.8,
                'students'    => 13600,
                'modules'     => [
                    ['Syntaxe Go, Structs, Interfaces & Pointeurs', '20:00', 'https://www.youtube.com/watch?v=yyUHQIec83I'],
                    ['Concurrence Native : Goroutines, Channels, Select & WaitGroups', '31:20', 'https://www.youtube.com/watch?v=LvgVSSpwND8'],
                    ['Communication Inter-Services Haute Vitesse avec gRPC & Protobuf', '28:40', 'https://www.youtube.com/watch?v=Yw4rkaTc0f8'],
                    ['Tests Unitaires, Benchmarks & Déploiement Binaire Distroless', '24:10', 'https://www.youtube.com/watch?v=8VSlKazcfVg'],
                ],
            ],
            [
                'title'       => 'PostgreSQL Avancé, Redis & Architecture de Données Haute Dispo',
                'description' => 'Optimisez vos bases de données relationnelles et NoSQL : indexation B-Tree/GIN, partitionnement PostgreSQL, cache distribué Redis et réplication.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.9,
                'students'    => 11900,
                'modules'     => [
                    ['Analyse de Plans d\'Exécution (EXPLAIN ANALYZE) & Index B-Tree/GIN', '26:30', 'https://www.youtube.com/watch?v=qw--VYLpxG4'],
                    ['Transactions MVCC, Verrous, Isolation & Partitionnement de Tables', '29:15', 'https://www.youtube.com/watch?v=7S_tz1z_5bA'],
                    ['JSONB Hybride, Recherche Full-Text & Extensions pgvector pour l\'IA', '25:00', 'https://www.youtube.com/watch?v=d626425_U2U'],
                    ['Cache Haute Performance, Pub/Sub & Rate Limiting avec Redis', '27:45', 'https://www.youtube.com/watch?v=jgpVdJB2sKQ'],
                ],
            ],
            [
                'title'       => 'Web3, Blockchain & Smart Contracts Solidity sur Ethereum',
                'description' => 'Concevez, auditez et déployez des applications décentralisées (dApps) : cryptographie Ethereum, Smart Contracts Solidity, Hardhat et intégration Ethers.js.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor,
                'rating'      => 4.7,
                'students'    => 10800,
                'modules'     => [
                    ['Architecture Blockchain, EVM, Gas & Cryptographie à Clé Publique', '22:15', 'https://www.youtube.com/watch?v=gyMwXuJrbJQ'],
                    ['Programmation de Smart Contracts en Solidity (ERC-20 & ERC-721)', '34:00', 'https://www.youtube.com/watch?v=M576WGiDBdQ'],
                    ['Tests Automatisés, Déploiement avec Hardhat & Audit de Sécurité', '28:30', 'https://www.youtube.com/watch?v=umepbfKp5rI'],
                    ['Connexion Frontend React avec Ethers.js, Wagmi & WalletConnect', '25:45', 'https://www.youtube.com/watch?v=a0osIaAOFSE'],
                ],
            ],
        ];

        foreach ($courses as $data) {
            $course = Course::create([
                'title'          => $data['title'],
                'description'    => $data['description'],
                'thumbnail'      => $data['thumbnail'],
                'user_id'        => $data['instructor']->id,
                'rating'         => $data['rating'],
                'students_count' => $data['students'],
            ]);

            foreach ($data['modules'] as $order => $mod) {
                Module::create([
                    'course_id' => $course->id,
                    'title'     => $mod[0],
                    'duration'  => $mod[1],
                    'video_url' => $mod[2],
                    'order'     => $order + 1,
                ]);
            }
        }

        // ── Enrollments ───────────────────────────────────────
        $allCourses = Course::all();
        Enrollment::create(['user_id' => $student->id, 'course_id' => $allCourses[0]->id, 'progress' => 45]);
        Enrollment::create(['user_id' => $student->id, 'course_id' => $allCourses[2]->id, 'progress' => 100]);
        Enrollment::create(['user_id' => $student->id, 'course_id' => $allCourses[3]->id, 'progress' => 20]);

        // ── Comments ──────────────────────────────────────────
        Comment::create(['user_id' => $student->id,     'course_id' => $allCourses[0]->id, 'body' => 'Ce cours est absolument excellent ! La qualité est au top.']);
        Comment::create(['user_id' => $instructor->id,  'course_id' => $allCourses[0]->id, 'body' => 'Merci beaucoup ! N\'hésitez pas si vous avez des questions.']);
        Comment::create(['user_id' => $student->id,     'course_id' => $allCourses[3]->id, 'body' => 'La partie Pandas est vraiment bien expliquée. Très clair !']);
    }
}
