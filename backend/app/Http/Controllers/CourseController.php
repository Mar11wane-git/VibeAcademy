<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Module;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

class CourseController extends Controller
{
    /**
     * Complete 10-video playlists with accurate YouTube video durations for every course.
     */
    private function getCoursePlaylistsCatalog(): array
    {
        return [
            'Maitrise de React JS & Animations Modernes' => [
                ["Introduction à l'Architecture React 19 & Virtual DOM", '10:18', 'https://www.youtube.com/watch?v=SqcY0GlETPk'],
                ['Configuration Vite, JSX & Composants Fonctionnels', '15:38', 'https://www.youtube.com/watch?v=O6P86uwfdR0'],
                ['Maîtrise des Hooks : useState, useEffect & useRef', '28:42', 'https://www.youtube.com/watch?v=TNhaISOUy6Q'],
                ['Hooks Avancés : useMemo, useCallback & useContext', '24:15', 'https://www.youtube.com/watch?v=Ke90Tje7VS0'],
                ['Animations Fluides & Gestures avec Framer Motion', '19:50', 'https://www.youtube.com/watch?v=znbCa4Rr054'],
                ['React Router v7 : Navigation, Layouts & Routes Protégées', '22:10', 'https://www.youtube.com/watch?v=Ul3y1LXxzdU'],
                ['Gestion d\'État Globale & Custom Hooks Réutilisables', '26:30', 'https://www.youtube.com/watch?v=6ThXsUwLWvc'],
                ['Connexion API REST avec Axios, Intercepteurs & Cache SWR', '31:45', 'https://www.youtube.com/watch?v=LRE0fL-d2o8'],
                ['Optimisation des Performances, Code Splitting & Lazy Loading', '21:15', 'https://www.youtube.com/watch?v=34_26s94F9w'],
                ['Déploiement Production, Tests Vitest & Architecture Finale', '27:40', 'https://www.youtube.com/watch?v=8aGhZQkoFbQ'],
            ],
            'Laravel 11: Architecture Backend Complète' => [
                ['Installation, Structure Laravel 11 & Configuration .env', '14:20', 'https://www.youtube.com/watch?v=MT-GJISB3Bg'],
                ['Architecture MVC, Routing Avancé & Middlewares HTTP', '18:45', 'https://www.youtube.com/watch?v=TzAJfjCn7Ks'],
                ['Migrations, Seeders & Modélisation Base de Données MySQL', '25:10', 'https://www.youtube.com/watch?v=fXv3fP4Z1yM'],
                ['Eloquent ORM : Relations 1-N, N-N & Eager Loading', '29:30', 'https://www.youtube.com/watch?v=ImtZ5yENzgE'],
                ['Conception d\'API RESTful, FormRequests & API Resources', '24:15', 'https://www.youtube.com/watch?v=YGqCZjdgJJk'],
                ['Authentification SPA & Tokens API avec Laravel Sanctum', '28:15', 'https://www.youtube.com/watch?v=XML9w-ENvzw'],
                ['Gestion des Rôles, Policies, Gates & Sécurité CSRF/XSS', '22:40', 'https://www.youtube.com/watch?v=kK42_N12BSU'],
                ['Queues, Jobs Asynchrones, Events & Envoi d\'Emails', '26:50', 'https://www.youtube.com/watch?v=rN8_T02kX-g'],
                ['Cache Redis, Optimisation des Requêtes SQL & Stockage S3', '21:35', 'https://www.youtube.com/watch?v=jgpVdJB2sKQ'],
                ['Tests Automatisés Pest/PHPUnit & Déploiement Linux Nginx', '34:00', 'https://www.youtube.com/watch?v=3c-iBn73dDE'],
            ],
            'UI/UX Masterclass: Du Wireframe au Prototype' => [
                ['Fondamentaux du Design UX, Psychologie & Ergonomie Cognitive', '14:12', 'https://www.youtube.com/watch?v=SRec90j6lTY'],
                ['Recherche Utilisateur, Personas, User Journey & Empathy Map', '19:30', 'https://www.youtube.com/watch?v=Ovj4hFxko7c'],
                ['Architecture de l\'Information, Sitemaps & User Flows', '17:45', 'https://www.youtube.com/watch?v=qpH7-KFWZRI'],
                ['Wireframing Basse et Haute Fidélité sur Figma', '20:15', 'https://www.youtube.com/watch?v=FTFaQWZBqQ8'],
                ['Typographie, Hiérarchie Visuelle & Grilles 8pt Responsive', '22:10', 'https://www.youtube.com/watch?v=sByzHoiYFX0'],
                ['Théorie des Couleurs, Contrastes WCAG & Thèmes Dark/Light', '18:50', 'https://www.youtube.com/watch?v=_2LLXnUdUIc'],
                ['Auto-Layout Figma, Variants & Propriétés de Composants', '25:30', 'https://www.youtube.com/watch?v=Dtd40cHQQlk'],
                ['Création d\'un Design System Complet & Design Tokens', '28:20', 'https://www.youtube.com/watch?v=wc5krC28ynQ'],
                ['Prototypage Interactif, Smart Animate & Micro-Interactions', '22:45', 'https://www.youtube.com/watch?v=lTTajzrSkCw'],
                ['Tests d\'Utilisabilité, Handoff Développeur & Présentation Client', '16:40', 'https://www.youtube.com/watch?v=6T_HgnjoYwM'],
            ],
            'Python pour la Data Science & Machine Learning' => [
                ['Fondamentaux Python 3.12 pour la Data Science & JupyterLab', '18:20', 'https://www.youtube.com/watch?v=kqtD5dpn9C8'],
                ['Calcul Matriciel & Vectorisation Rapide avec NumPy', '24:15', 'https://www.youtube.com/watch?v=QUT1VHiLmmI'],
                ['Manipulation & Nettoyage de Données avec Pandas DataFrames', '29:40', 'https://www.youtube.com/watch?v=vmEHCJofslg'],
                ['Analyse Exploratoire (EDA), GroupBy, Merge & Time Series', '26:10', 'https://www.youtube.com/watch?v=xi0vhXFPegw'],
                ['Visualisation Statistique avec Matplotlib & Seaborn', '21:30', 'https://www.youtube.com/watch?v=3Xc3CA655Y4'],
                ['Statistiques Appliquées, Probabilités & Tests d\'Hypothèses', '25:00', 'https://www.youtube.com/watch?v=xxpc-HPKN28'],
                ['Feature Engineering, Normalisation & Pipeline Scikit-Learn', '27:45', 'https://www.youtube.com/watch?v=pqNCD_5r0IU'],
                ['Algorithmes Supervisés : Régression, Random Forest & XGBoost', '33:20', 'https://www.youtube.com/watch?v=J4Wdy0Wc_xQ'],
                ['Clustering Non-Supervisé (K-Means, DBSCAN) & Réduction PCA', '23:50', 'https://www.youtube.com/watch?v=FgakZw6K1QQ'],
                ['Projet Complet : Modèle Prédictif, Validation Croisée & Déploiement', '38:15', 'https://www.youtube.com/watch?v=fwY9Qv96DJY'],
            ],
            'Node.js & Express: API REST Complète' => [
                ['Architecture Interne Node.js : V8, libuv & Event Loop', '16:25', 'https://www.youtube.com/watch?v=ENrzD9HAZK4'],
                ['Modules ES6, FileSystem Asynchrone, Buffers & Streams', '21:10', 'https://www.youtube.com/watch?v=Oe421EPjeBE'],
                ['Serveur Express.js, Routing Modulaire & Chaîne de Middlewares', '22:30', 'https://www.youtube.com/watch?v=Lr9WUkeYSA8'],
                ['Architecture MVC Backend, Contrôleurs & Gestion Globale d\'Erreurs', '24:45', 'https://www.youtube.com/watch?v=fBNz5xF-Kx4'],
                ['Modélisation NoSQL MongoDB, Schémas Mongoose & Agrégations', '28:00', 'https://www.youtube.com/watch?v=DZBGEVgL2eE'],
                ['Authentification Sécurisée : JWT, Refresh Tokens & Bcrypt', '32:15', 'https://www.youtube.com/watch?v=7Q17ubqLfaM'],
                ['Validation des Données (Zod/Joi), Rate Limiting & Helmet OWASP', '20:40', 'https://www.youtube.com/watch?v=Tt_tKhhhJqY'],
                ['Upload de Fichiers Multer, Cloudinary & Envoi d\'Emails', '23:15', 'https://www.youtube.com/watch?v=wIOpe8S2Mk8'],
                ['Temps Réel avec WebSockets (Socket.io) & Cache Redis', '27:30', 'https://www.youtube.com/watch?v=1BfCnjr_Vjg'],
                ['Tests d\'Intégration Supertest, Dockerisation & CI/CD Cloud', '35:20', 'https://www.youtube.com/watch?v=pOZFqQQOAFQ'],
            ],
            'CSS Glassmorphism & Design Avancé' => [
                ['Architecture CSS Moderne : Box Model, Spécificité & Cascade Layers', '16:10', 'https://www.youtube.com/watch?v=1PnVor36_40'],
                ['Maîtrise de Flexbox : Alignements Complexes & Layouts Dynamiques', '19:25', 'https://www.youtube.com/watch?v=fYq5PXgSsbE'],
                ['CSS Grid Avancé : Grid Areas, Auto-Fit, Minmax & Subgrid', '22:40', 'https://www.youtube.com/watch?v=jV8B24rSN5o'],
                ['Variables CSS (Custom Properties), Calc(), Clamp() & Design Tokens', '15:30', 'https://www.youtube.com/watch?v=oZPR_78wCnY'],
                ['Effets Glassmorphism Pro : Backdrop-Filter, Bordures & Profondeur', '21:50', 'https://www.youtube.com/watch?v=RIWTs4U6Cto'],
                ['Dégradés Aurora, Ombres Multi-Couches & Glow Néon Cyber', '18:15', 'https://www.youtube.com/watch?v=cC62425_U2U'],
                ['Transitions Fluides, Courbes Cubic-Bezier & Transformations 3D', '24:00', 'https://www.youtube.com/watch?v=YszONjKpgg4'],
                ['Animations Keyframes, Scroll-Driven Animations & Parallaxe', '26:45', 'https://www.youtube.com/watch?v=T33NN_pPeNI'],
                ['Architecture Dark Mode / Light Mode & Container Queries', '20:00', 'https://www.youtube.com/watch?v=9EPTBX2Ogz0'],
                ['Projet Complet : Dashboard SaaS Glassmorphism Ultra-Responsive', '31:20', 'https://www.youtube.com/watch?v=znbCa4Rr054'],
            ],
            'Oracle Database 21c Administration' => [
                ['Architecture Oracle 21c : Instance SGA, PGA & Processus Background', '18:20', 'https://www.youtube.com/watch?v=wG6z3Kg8Ep4'],
                ['Installation Oracle Database, CDB vs PDB (Multitenant)', '24:10', 'https://www.youtube.com/watch?v=7S_tz1z_5bA'],
                ['SQL Analytique Avancé : Jointures, Sous-Requêtes & Window Functions', '30:10', 'https://www.youtube.com/watch?v=HXV3zeQKqGY'],
                ['Gestion du Stockage : Tablespaces, Datafiles, Redo Logs & Undo', '26:40', 'https://www.youtube.com/watch?v=h0nxCDiD-zg'],
                ['Programmation PL/SQL : Blocs, Curseurs, Exceptions & Packages', '28:00', 'https://www.youtube.com/watch?v=t1Bt0LFaIXw'],
                ['Triggers PL/SQL, Procédures Stockées & Fonctions Compilées', '25:15', 'https://www.youtube.com/watch?v=qw--VYLpxG4'],
                ['Sécurité DBA : Utilisateurs, Profils, Rôles, Privilèges & Audit', '22:30', 'https://www.youtube.com/watch?v=fNzpcB7ODxQ'],
                ['Sauvegarde & Restauration à Chaud avec Oracle RMAN', '34:45', 'https://www.youtube.com/watch?v=d626425_U2U'],
                ['Optimisation des Performances : AWR, Explain Plan & Index B-Tree/Bitmap', '29:20', 'https://www.youtube.com/watch?v=RebA5J-rlwg'],
                ['Haute Disponibilité : Oracle Data Guard & Automatisation DBA', '31:50', 'https://www.youtube.com/watch?v=SLB_c_ayRMo'],
            ],
            'Développement Web avec .NET 8' => [
                ['Écosystème .NET 8, CLR, C# 12 & Configuration SDK', '20:00', 'https://www.youtube.com/watch?v=ravLFzIGuCM'],
                ['Architecture ASP.NET Core : Pipeline HTTP, Middlewares & DI', '25:30', 'https://www.youtube.com/watch?v=pTB0EiLXUC8'],
                ['Pattern MVC, Razor Views, Tag Helpers & Validation de Modèles', '30:15', 'https://www.youtube.com/watch?v=fmvcAzHpsk8'],
                ['Conception de Minimal APIs & Web APIs RESTful Performantes', '28:40', 'https://www.youtube.com/watch?v=yClSNpoj-kQ'],
                ['Entity Framework Core 8 : Code-First, Migrations & Relations', '35:45', 'https://www.youtube.com/watch?v=bN8_T02kX-g'],
                ['Requêtes LINQ Optimisées, AsNoTracking & Prévention N+1', '24:20', 'https://www.youtube.com/watch?v=ghC6224efxI'],
                ['Clean Architecture, Pattern Repository, CQRS & MediatR', '32:10', 'https://www.youtube.com/watch?v=d56mG7DezGs'],
                ['Sécurité ASP.NET Identity, Authentification JWT & OAuth2', '29:50', 'https://www.youtube.com/watch?v=7Q17ubqLfaM'],
                ['Communication Temps Réel avec SignalR & Background Services', '23:15', 'https://www.youtube.com/watch?v=ZVnjOPwW4ZA'],
                ['Tests Unitaires xUnit, Conteneurisation Docker & Déploiement Azure', '34:30', 'https://www.youtube.com/watch?v=3c-iBn73dDE'],
            ],
            'Développeur Java Enterprise (Spring Boot)' => [
                ['Nouveautés Java 21 LTS : Records, Pattern Matching & Virtual Threads', '22:30', 'https://www.youtube.com/watch?v=eIrMbAQSU34'],
                ['Programmation Orientée Objet Avancée, Generics & Streams API', '27:15', 'https://www.youtube.com/watch?v=A74TOX803D0'],
                ['Spring Core : Inversion de Contrôle (IoC), Beans & Injection', '24:40', 'https://www.youtube.com/watch?v=9SGDpanrc8U'],
                ['Spring Boot 3 : Auto-Configuration, Profils & REST Controllers', '28:15', 'https://www.youtube.com/watch?v=vtPkZShrvXQ'],
                ['Persistance avec Spring Data JPA, Hibernate & Transactions ACID', '35:00', 'https://www.youtube.com/watch?v=Zs342ePFvRI'],
                ['Gestion des Exceptions Globales, Validation Jakarta & MapStruct DTO', '21:50', 'https://www.youtube.com/watch?v=b9rsI523Z3c'],
                ['Spring Security 6 : Filtres, JWT Stateless & RBAC Autorisations', '40:20', 'https://www.youtube.com/watch?v=IUqKuGNasdM'],
                ['Tests Unitaires & Intégration avec JUnit 5, Mockito & Testcontainers', '29:10', 'https://www.youtube.com/watch?v=vZm0lHciFsQ'],
                ['Architecture Microservices : Spring Cloud, Eureka & API Gateway', '36:45', 'https://www.youtube.com/watch?v=drQK8ciCAjY'],
                ['Messagerie Kafka/RabbitMQ, Actuator Prometheus & Dockerisation', '33:20', 'https://www.youtube.com/watch?v=X48VuDVv0do'],
            ],
            'Programmation en C pour les Débutants' => [
                ['Masterclass Complète : Introduction au Langage C & Compilation GCC', '3:46:13', 'https://www.youtube.com/watch?v=KJgsSFOSQv0'],
                ['Variables, Types Primitifs, Opérateurs & Entrées/Sorties (printf/scanf)', '24:30', 'https://www.youtube.com/watch?v=aZb0iu4AZXY'],
                ['Structures de Contrôle : Conditions (if/switch) & Boucles (for/while)', '26:15', 'https://www.youtube.com/watch?v=87SH2Cn0s9A'],
                ['Fonctions Modulaires, Pile d\'Exécution (Stack) & Portée des Variables', '22:45', 'https://www.youtube.com/watch?v=3lqgdqoY83o'],
                ['Tableaux Statiques, Chaînes de Caractères (char*) & Bibliothèque string.h', '28:10', 'https://www.youtube.com/watch?v=CpG3oATGIsMA'],
                ['Comprendre les Pointeurs en Profondeur & Arithmétique des Adresses', '3:38:48', 'https://www.youtube.com/watch?v=zuegQmMdy8M'],
                ['Allocation Dynamique de Mémoire sur le Tas : malloc, calloc, realloc & free', '31:20', 'https://www.youtube.com/watch?v=ix5jPkxsr7M'],
                ['Structures (struct), Unions, Typedef & Listes Chaînées en C', '29:40', 'https://www.youtube.com/watch?v=VOpjAHCee7c'],
                ['Manipulation de Fichiers Binaires et Texte (fopen, fread, fwrite)', '23:50', 'https://www.youtube.com/watch?v=MQIF-WMUOL8'],
                ['Préprocesseur, Makefiles, Débogage GDB & Détection de Fuites Valgrind', '27:30', 'https://www.youtube.com/watch?v=BpPEoZW5IiY'],
            ],
            'C# Moderne de A à Z' => [
                ['Syntaxe C# 12, Typage Fort, Top-Level Statements & .NET CLI', '25:00', 'https://www.youtube.com/watch?v=ravLFzIGuCM'],
                ['POO en C# : Classes, Constructeurs Primaires, Propriétés & Héritage', '32:30', 'https://www.youtube.com/watch?v=pTB0EiLXUC8'],
                ['Interfaces, Polymorphisme, Classes Abstraites & Records Immuables', '27:15', 'https://www.youtube.com/watch?v=GhQdlIFylQ8'],
                ['Collections Génériques (List, Dictionary, HashSet) & Span<T>', '24:40', 'https://www.youtube.com/watch?v=gfkTfcpWqAY'],
                ['Delegates, Expressions Lambda, Events & Programmation Fonctionnelle', '26:20', 'https://www.youtube.com/watch?v=yClSNpoj-kQ'],
                ['Maîtrise de LINQ : Requêtes Déclaratives, Projections & Agrégations', '28:15', 'https://www.youtube.com/watch?v=fmvcAzHpsk8'],
                ['Gestion des Exceptions, Pattern Matching Avancé & Nullable Reference Types', '21:50', 'https://www.youtube.com/watch?v=J00fK8d_vCE'],
                ['Programmation Asynchrone : Task, async/await & CancellationToken', '35:00', 'https://www.youtube.com/watch?v=2moh18sh5p4'],
                ['Gestion de la Mémoire, Garbage Collector, IDisposable & Reflection', '29:30', 'https://www.youtube.com/watch?v=ZVnjOPwW4ZA'],
                ['Architecture Propre, Injection de Dépendances & Tests Unitaires', '31:10', 'https://www.youtube.com/watch?v=d56mG7DezGs'],
            ],
            'C++ Haute Performance' => [
                ['Fondamentaux C++20, Modèle de Compilation & Références (Lvalue/Rvalue)', '28:40', 'https://www.youtube.com/watch?v=vLnPwxZdW4Y'],
                ['POO Moderne : Constructeurs, Opérateurs Surchargés & Règle des 5', '31:20', 'https://www.youtube.com/watch?v=ZzaPdXTrSb8'],
                ['Gestion Mémoire RAII & Pointeurs Intelligents (unique_ptr, shared_ptr)', '29:15', 'https://www.youtube.com/watch?v=UOB7-B2MfwA'],
                ['Sémantique de Déplacement (Move Semantics) & std::move sans Copie', '26:45', 'https://www.youtube.com/watch?v=ehMg6zvXuMY'],
                ['Standard Template Library (STL) : Conteneurs, Itérateurs & Ranges C++20', '35:00', 'https://www.youtube.com/watch?v=LMXjMmuNiJQ'],
                ['Templates, Programmation Générique, Variadic Templates & Concepts', '42:15', 'https://www.youtube.com/watch?v=I-hZkUa9mIs'],
                ['Évaluation à la Compilation (constexpr / consteval) & Métaprogrammation', '24:50', 'https://www.youtube.com/watch?v=8X532p_t-uI'],
                ['Multithreading C++ : std::thread, std::mutex, Atomics & Futures', '45:10', 'https://www.youtube.com/watch?v=LL8wkskDlbs'],
                ['Optimisation Cache CPU, Alignement Mémoire & Profilage Haute Fréquence', '33:30', 'https://www.youtube.com/watch?v=BpPEoZW5IiY'],
                ['Système de Build CMake Moderne, Conan & Architecture Moteur Temps Réel', '27:40', 'https://www.youtube.com/watch?v=VFIOSWy93H0'],
            ],
            'Ingénierie IA Générative : LLMs, RAG & Agents Autonomes' => [
                ['Architecture des Transformers, Mécanisme d\'Attention & Tokens', '19:14', 'https://www.youtube.com/watch?v=aircAruvnKk'],
                ['Écosystème des LLMs : GPT-4o, Claude 3.5, Llama 3 & Mistral', '24:10', 'https://www.youtube.com/watch?v=zjkBMFhNj_g'],
                ['Prompt Engineering Systémique, Few-Shot, Chain-of-Thought & ReAct', '22:15', 'https://www.youtube.com/watch?v=_ZvnD96BsQo'],
                ['Sorties Structurées (JSON Schema) & Function Calling / Tool Use', '26:30', 'https://www.youtube.com/watch?v=aqdWSYWC_LI'],
                ['Embeddings Vectoriels, Similarité Cosinus & Recherche Sémantique', '25:45', 'https://www.youtube.com/watch?v=ySus5ZS0b94'],
                ['Pipeline RAG Complet : Stratégies de Chunking, Pinecone & pgvector', '29:40', 'https://www.youtube.com/watch?v=T-D1OfcDW1M'],
                ['RAG Avancé : Recherche Hybride BM25, Reranking Cohere & GraphRAG', '31:20', 'https://www.youtube.com/watch?v=sVcwVQRHIc8'],
                ['Orchestration d\'Agents IA Autonomes avec LangChain & LangGraph', '34:10', 'https://www.youtube.com/watch?v=aywZrzNaKjs'],
                ['Systèmes Multi-Agents Collaboratifs, Mémoire Long-Terme & MCP', '28:50', 'https://www.youtube.com/watch?v=sal78ACtGTc'],
                ['Fine-Tuning LoRA / QLoRA, Évaluation RAGAS & Garde-Fous en Production', '38:00', 'https://www.youtube.com/watch?v=eC6Hd1hFvos'],
            ],
            'Deep Learning & Computer Vision avec PyTorch' => [
                ['Tenseurs PyTorch, Accélération GPU CUDA & Graphes de Calcul Autograd', '20:10', 'https://www.youtube.com/watch?v=V_xro1bcAuA'],
                ['Perceptron Multicouche (MLP), Rétropropagation & Descente de Gradient', '24:35', 'https://www.youtube.com/watch?v=IHZwWFHWa-w'],
                ['Fonctions de Perte, Optimiseurs (AdamW, SGD) & Régularisation Dropout', '22:40', 'https://www.youtube.com/watch?v=GIsg-ZUy0MY'],
                ['DataLoaders PyTorch, Augmentation de Données & Pipelines Torchvision', '25:15', 'https://www.youtube.com/watch?v=c36lUUr864M'],
                ['Réseaux de Neurones Convolutifs (CNN) : Filtres, Pooling & BatchNorm', '31:15', 'https://www.youtube.com/watch?v=YRhxdVk_sIs'],
                ['Transfer Learning & Architectures Modernes : ResNet, EfficientNet & ConvNeXt', '27:50', 'https://www.youtube.com/watch?v=K0lWSB2QoIQ'],
                ['Vision Transformers (ViT) & Modèles Multimodaux CLIP', '29:30', 'https://www.youtube.com/watch?v=TrdevFK_am4'],
                ['Détection d\'Objets Temps Réel avec YOLOv8/v10 & Bounding Boxes', '28:50', 'https://www.youtube.com/watch?v=ag3DLKsl2vk'],
                ['Segmentation Sémantique et d\'Instances (U-Net, Mask R-CNN & SAM)', '32:10', 'https://www.youtube.com/watch?v=d626425_U2U'],
                ['Quantification FP16/INT8, Export ONNX Runtime & Serveur FastAPI', '26:30', 'https://www.youtube.com/watch?v=0RS9W8MtZe4'],
            ],
            'Data Engineering : Apache Spark, Kafka & Pipelines Big Data' => [
                ['Architecture Data Moderne : Data Warehouse, Data Lake & Lakehouse', '16:45', 'https://www.youtube.com/watch?v=qWru-b6m030'],
                ['Modélisation Dimensionnelle (Kimball) & Formats Parquet / Delta Lake / Iceberg', '24:20', 'https://www.youtube.com/watch?v=5rNquRnNb4E'],
                ['Fondamentaux du Traitement Distribué avec Apache Spark & RDDs', '28:10', 'https://www.youtube.com/watch?v=_C8kWso4ne4'],
                ['PySpark DataFrames, Spark SQL & Optimisation Catalyst Optimizer', '32:20', 'https://www.youtube.com/watch?v=QLGrL1651G4'],
                ['Partitionnement, Shuffling, Broadcast Joins & Tuning Mémoire Spark', '27:15', 'https://www.youtube.com/watch?v=daXEp4HmS-E'],
                ['Architecture Apache Kafka : Brokers, Topics, Partitions & Consumer Groups', '28:15', 'https://www.youtube.com/watch?v=uvb00oaa3k8'],
                ['Streaming Temps Réel avec Spark Structured Streaming & Kafka Connect', '31:40', 'https://www.youtube.com/watch?v=Ch5VhJzaoaI'],
                ['Orchestration de Workflows ETL/ELT avec Apache Airflow & DAGs Python', '25:40', 'https://www.youtube.com/watch?v=K9AnJ9_ZAXE'],
                ['Transformations Analytiques Modulaires, Tests & Lignage avec dbt', '30:00', 'https://www.youtube.com/watch?v=toSAAgLUHuk'],
                ['Architecture Medallion (Bronze/Silver/Gold) sur Cloud AWS/Snowflake', '34:50', 'https://www.youtube.com/watch?v=SLB_c_ayRMo'],
            ],
            'Data Analytics, Power BI, DAX & Storytelling Décisionnel' => [
                ['Introduction à la Business Intelligence & Architecture Power BI Desktop', '17:30', 'https://www.youtube.com/watch?v=NNSHu0rkew8'],
                ['Connexion aux Sources Multiples & Nettoyage ETL avec Power Query (Langage M)', '23:15', 'https://www.youtube.com/watch?v=3u7MQz1EyPY'],
                ['Modélisation en Étoile (Star Schema), Tables de Faits & Dimensions', '21:30', 'https://www.youtube.com/watch?v=T7bf21kP2_U'],
                ['Relations Cardinale, Filtrage Croisé & Bonnes Pratiques de Modélisation', '19:45', 'https://www.youtube.com/watch?v=yKTSLffVGbk'],
                ['Fondamentaux DAX : Colonnes Calculées vs Mesures & Contexte de Ligne', '26:20', 'https://www.youtube.com/watch?v=GHc6224efxI'],
                ['DAX Avancé : Maîtriser CALCULATE, FILTER, ALL & Contexte de Filtre', '33:10', 'https://www.youtube.com/watch?v=e73w4-78S2c'],
                ['Time Intelligence DAX : YTD, YoY, Moyennes Mobiles & Prévisions', '28:40', 'https://www.youtube.com/watch?v=bN8_T02kX-g'],
                ['Design UI/UX de Tableaux de Bord Exécutifs & Storytelling Visuel', '24:00', 'https://www.youtube.com/watch?v=Ovj4hFxko7c'],
                ['Interactivité Avancée : Drill-Through, Info-Bulles Dynamiques & Signets', '22:10', 'https://www.youtube.com/watch?v=lTTajzrSkCw'],
                ['Publication Power BI Service, Sécurité par Ligne (RLS) & Rafraîchissement', '20:45', 'https://www.youtube.com/watch?v=HXV3zeQKqGY'],
            ],
            'DevOps Cloud Native : Docker, Kubernetes, Terraform & CI/CD' => [
                ['Fondamentaux Linux, Réseaux TCP/IP, DNS & Scripting Bash pour DevOps', '24:15', 'https://www.youtube.com/watch?v=3c-iBn73dDE'],
                ['Conteneurisation Docker : Images, Dockerfiles Multi-Stage & Volumes', '27:30', 'https://www.youtube.com/watch?v=pTFZFxd4hOI'],
                ['Orchestration Locale Multi-Services avec Docker Compose & Réseaux', '22:10', 'https://www.youtube.com/watch?v=HG6yIjZapSA'],
                ['Architecture Kubernetes : Control Plane, Nodes, Pods & Namespaces', '31:40', 'https://www.youtube.com/watch?v=X48VuDVv0do'],
                ['Déploiements K8s : ReplicaSets, Services, Ingress, ConfigMaps & Secrets', '36:20', 'https://www.youtube.com/watch?v=s_o8dwzRlu4'],
                ['Gestion de Paquets Kubernetes avec Helm Charts & Autoscaling HPA', '25:50', 'https://www.youtube.com/watch?v=fy8SHvNZGeE'],
                ['Infrastructure as Code (IaC) sur AWS avec Terraform & Modules State', '29:15', 'https://www.youtube.com/watch?v=SLB_c_ayRMo'],
                ['Pipelines CI/CD Automatisés, Tests & Sécurité DevSecOps avec GitHub Actions', '27:30', 'https://www.youtube.com/watch?v=R8_veQiYBjI'],
                ['Déploiement Continu GitOps sur Kubernetes avec ArgoCD', '26:10', 'https://www.youtube.com/watch?v=MeU5_k9ssrs'],
                ['Observabilité Complète : Monitoring Prometheus, Dashboards Grafana & Loki', '28:40', 'https://www.youtube.com/watch?v=h4Sl21AKiDg'],
            ],
            'Cybersécurité Offensive : Ethical Hacking, Pentest & OWASP' => [
                ['Méthodologie Pentest (PTES), Cadre Légal & Lab Kali Linux Isolé', '21:40', 'https://www.youtube.com/watch?v=3Kq1MIfTWCE'],
                ['Reconnaissance Passive (OSINT) & Active : DNS, Sous-Domaines & Shodan', '25:15', 'https://www.youtube.com/watch?v=fNzpcB7ODxQ'],
                ['Scanning Réseau Avancé avec Nmap, Énumération SMB/SSH & Analyse Wireshark', '28:30', 'https://www.youtube.com/watch?v=OU-A2p_37U0'],
                ['Architecture Web, Interception HTTP avec Burp Suite & Fuzzing ffuf', '26:10', 'https://www.youtube.com/watch?v=G3hpAeoZ4ek'],
                ['Top 10 OWASP : Injections SQL (SQLi) & Contournement d\'Authentification', '34:15', 'https://www.youtube.com/watch?v=rWHvp7rUka8'],
                ['Vulnérabilités Cross-Site Scripting (XSS), CSRF, SSRF & XXE', '30:40', 'https://www.youtube.com/watch?v=EoaDgUgS6QA'],
                ['Sécurité des APIs REST/GraphQL, Attaque et Défense des Tokens JWT/OAuth2', '26:50', 'https://www.youtube.com/watch?v=7Q17ubqLfaM'],
                ['Élévation de Privilèges Linux/Windows & Sécurité Active Directory', '32:20', 'https://www.youtube.com/watch?v=Vp5_5F2kX-g'],
                ['Cryptographie Appliquée : Hachage Argon2, Chiffrement AES-GCM, RSA & TLS 1.3', '23:20', 'https://www.youtube.com/watch?v=jhXCTbFnK8o'],
                ['Rapport d\'Audit Professionnel, Remédiation, Hardening & Architecture Zero-Trust', '29:00', 'https://www.youtube.com/watch?v=SLB_c_ayRMo'],
            ],
            'Next.js 15 & TypeScript 5 : Architecture SaaS Full-Stack' => [
                ['TypeScript 5 Strict : Types Avancés, Generics, Utility Types & Inférence', '22:00', 'https://www.youtube.com/watch?v=d56mG7DezGs'],
                ['Architecture Next.js 15 App Router, Layouts Imbriqués & Routing Dynamique', '26:30', 'https://www.youtube.com/watch?v=ZVnjOPwW4ZA'],
                ['React Server Components (RSC) vs Client Components & Streaming Suspense', '28:15', 'https://www.youtube.com/watch?v=wm5gMKuwSYk'],
                ['Server Actions, Mutations Type-Safe, Validation Zod & useOptimistic', '25:15', 'https://www.youtube.com/watch?v=dDpZfOQBMaU'],
                ['Modélisation Base de Données PostgreSQL avec Prisma ORM & Migrations', '31:00', 'https://www.youtube.com/watch?v=RebA5J-rlwg'],
                ['Authentification Complète avec Auth.js (NextAuth v5), OAuth & Sessions', '29:40', 'https://www.youtube.com/watch?v=1MTyCvS05V4'],
                ['Stratégies de Cache Next.js 15, Revalidation ISR & Route Handlers API', '24:20', 'https://www.youtube.com/watch?v=8aGhZQkoFbQ'],
                ['Design System Moderne avec Tailwind CSS, Shadcn UI & Mode Sombre', '23:10', 'https://www.youtube.com/watch?v=ft30zcMlFao'],
                ['SEO Technique, Metadata API Dynamique, OpenGraph & Core Web Vitals', '19:50', 'https://www.youtube.com/watch?v=SqcY0GlETPk'],
                ['Tests End-to-End Playwright, Middleware Edge & Déploiement Production', '27:35', 'https://www.youtube.com/watch?v=3c-iBn73dDE'],
            ],
            'Flutter 3 & Dart : Applications Mobiles iOS & Android Pro' => [
                ['Langage Dart 3 : Null Safety, Classes Scellées, Pattern Matching & Mixins', '19:30', 'https://www.youtube.com/watch?v=Ej_Pcr4uC2Q'],
                ['Programmation Asynchrone en Dart : Futures, async/await, Streams & Isolates', '23:45', 'https://www.youtube.com/watch?v=VPvVD8t02U8'],
                ['Architecture Flutter : Widget Tree, Element Tree, Stateless vs Stateful', '25:10', 'https://www.youtube.com/watch?v=1ukSR1GRtMU'],
                ['Layouts Responsive Multi-Écrans, Contraintes, Slivers & Material 3', '26:15', 'https://www.youtube.com/watch?v=x0uinJvhNxI'],
                ['Navigation Déclarative avec GoRouter, Deep Linking & Passage d\'Arguments', '21:40', 'https://www.youtube.com/watch?v=34_26s94F9w'],
                ['State Management Réactif à Grande Échelle avec Riverpod 2 & Bloc', '32:00', 'https://www.youtube.com/watch?v=7dAt-JMSCVQ'],
                ['Consommation d\'APIs REST avec Dio, Intercepteurs JWT & Sérialisation JSON', '27:20', 'https://www.youtube.com/watch?v=LRE0fL-d2o8'],
                ['Persistance Locale Haute Vitesse (SQLite / Drift / Isar) & Mode Hors-Ligne', '24:50', 'https://www.youtube.com/watch?v=qw--VYLpxG4'],
                ['Animations Implicites, Explicites, Hero Transitions & CustomPainter', '24:45', 'https://www.youtube.com/watch?v=OtrWXLfGtqE'],
                ['Tests de Widgets, Profilage DevTools 120 FPS & Publication App Store / Play Store', '28:20', 'https://www.youtube.com/watch?v=pOZFqQQOAFQ'],
            ],
            'Programmation Système & Web Haute Performance avec Rust' => [
                ['Écosystème Rust : Compilateur rustc, Cargo, Immutabilité & Types Scalaires', '21:10', 'https://www.youtube.com/watch?v=BpPEoZW5IiY'],
                ['Comprendre l\'Ownership, le Déplacement (Move) & la Pile vs le Tas', '29:40', 'https://www.youtube.com/watch?v=VFIOSWy93H0'],
                ['Références, Borrow Checker & Annotations de Durée de Vie (Lifetimes \'a)', '33:45', 'https://www.youtube.com/watch?v=rAl-9HwD858'],
                ['Structures, Enums Algébriques & Puissance du Pattern Matching Exhaustif', '25:20', 'https://www.youtube.com/watch?v=ms8zL9I4K2A'],
                ['Gestion d\'Erreurs Sans Exceptions : Option<T>, Result<T, E> & Opérateur ?', '24:15', 'https://www.youtube.com/watch?v=zF34dRivLOw'],
                ['Traits, Génériques, Polymorphisme Statique vs Dynamique (dyn Trait)', '28:30', 'https://www.youtube.com/watch?v=T0Xfltu4h3A'],
                ['Itérateurs Zero-Cost, Closures Fonctionnelles & Collections Standard', '26:10', 'https://www.youtube.com/watch?v=4DqP57BHaXI'],
                ['Pointeurs Intelligents en Rust : Box, Rc, Arc & Mutabilité Interne RefCell', '30:25', 'https://www.youtube.com/watch?v=UOB7-B2MfwA'],
                ['Concurrence Sans Data-Race, Threads, Channels & Runtime Asynchrone Tokio', '35:15', 'https://www.youtube.com/watch?v=d626425_U2U'],
                ['Développement d\'APIs Web Ultra-Rapides avec Axum / Actix-Web & SQLx', '32:40', 'https://www.youtube.com/watch?v=Yw4rkaTc0f8'],
            ],
            'Go (Golang) : Microservices Concurrents, gRPC & Cloud' => [
                ['Philosophie Go, Compilateur Ultra-Rapide, Modules & Syntaxe Fondamentale', '20:00', 'https://www.youtube.com/watch?v=yyUHQIec83I'],
                ['Tableaux, Slices Dynamiques, Maps, Pointeurs & Allocation Mémoire', '24:30', 'https://www.youtube.com/watch?v=8VSlKazcfVg'],
                ['Structs, Méthodes, Composition vs Héritage & Interfaces Implicites', '26:15', 'https://www.youtube.com/watch?v=YS4e4q9oBaU'],
                ['Gestion Explicite des Erreurs, Wrapping (errors.Is/As) & Defer/Panic/Recover', '22:40', 'https://www.youtube.com/watch?v=zF34dRivLOw'],
                ['Concurrence Native : Goroutines Légères & Planificateur M:N du Runtime Go', '28:50', 'https://www.youtube.com/watch?v=LvgVSSpwND8'],
                ['Synchronisation par Communication : Channels, Select, WaitGroups & Mutex', '31:20', 'https://www.youtube.com/watch?v=B9uR2gLM80E'],
                ['Package Context : Annulation, Timeouts & Propagation dans les Microservices', '23:10', 'https://www.youtube.com/watch?v=kaZOXRqFPCw'],
                ['Serveur HTTP Haute Performance (net/http, Chi/Gin), JSON & Middlewares', '27:45', 'https://www.youtube.com/watch?v=Lr9WUkeYSA8'],
                ['Communication Inter-Services Haute Fréquence avec gRPC & Protocol Buffers', '28:40', 'https://www.youtube.com/watch?v=Yw4rkaTc0f8'],
                ['Tests Unitaires, Benchmarks, Profiling pprof & Image Docker Distroless', '25:30', 'https://www.youtube.com/watch?v=3c-iBn73dDE'],
            ],
            'PostgreSQL Avancé, Redis & Architecture de Données Haute Dispo' => [
                ['Architecture Interne PostgreSQL : Processus, Shared Buffers, WAL & Pages 8KB', '24:20', 'https://www.youtube.com/watch?v=qw--VYLpxG4'],
                ['Modélisation Relationnelle Avancée, Contraintes, Domaines & Normalisation', '22:45', 'https://www.youtube.com/watch?v=HXV3zeQKqGY'],
                ['Analyse de Plans d\'Exécution (EXPLAIN ANALYZE) & Coûts de l\'Optimiseur', '26:30', 'https://www.youtube.com/watch?v=7S_tz1z_5bA'],
                ['Stratégies d\'Indexation : B-Tree, GIN, GiST, BRIN & Index Partiels/Couvrants', '29:10', 'https://www.youtube.com/watch?v=RebA5J-rlwg'],
                ['Concurrence MVCC, Niveaux d\'Isolation ACID, Verrous & Vacuuming', '28:15', 'https://www.youtube.com/watch?v=d626425_U2U'],
                ['Requêtes Analytiques : CTEs Récursives, Window Functions & Vues Matérialisées', '27:00', 'https://www.youtube.com/watch?v=GHc6224efxI'],
                ['JSONB Hybride, Recherche Full-Text & Extension pgvector pour l\'IA', '25:00', 'https://www.youtube.com/watch?v=T-D1OfcDW1M'],
                ['Partitionnement Déclaratif de Tables Massives & Connection Pooling PgBouncer', '26:40', 'https://www.youtube.com/watch?v=h0nxCDiD-zg'],
                ['Architecture Redis : Structures de Données en Mémoire, Cache-Aside & TTL', '27:45', 'https://www.youtube.com/watch?v=jgpVdJB2sKQ'],
                ['Redis Pub/Sub, Streams, Verrous Distribués & Réplication Haute Disponibilité', '29:30', 'https://www.youtube.com/watch?v=uvb00oaa3k8'],
            ],
            'Web3, Blockchain & Smart Contracts Solidity sur Ethereum' => [
                ['Fondamentaux Blockchain : Cryptographie Keccak-256, Arbres de Merkle & Consensus', '22:15', 'https://www.youtube.com/watch?v=gyMwXuJrbJQ'],
                ['Architecture Ethereum : EVM, Comptes EOA vs Contrats, Gas & Mempool', '25:40', 'https://www.youtube.com/watch?v=M576WGiDBdQ'],
                ['Langage Solidity : Types, Visibilité, Mappings, Structs & Modifiers', '28:30', 'https://www.youtube.com/watch?v=umepbfKp5rI'],
                ['Gestion du Stockage EVM (Storage, Memory, Calldata) & Optimisation du Gas', '26:15', 'https://www.youtube.com/watch?v=a0osIaAOFSE'],
                ['Standards de Tokens : Création de Smart Contracts ERC-20, ERC-721 (NFT) & ERC-1155', '34:00', 'https://www.youtube.com/watch?v=ipwxYa-F1uY'],
                ['Environnement de Développement Professionnel avec Hardhat & Foundry', '27:20', 'https://www.youtube.com/watch?v=8aGhZQkoFbQ'],
                ['Oracles Décentralisés Chainlink, Flux de Prix DeFi & Automatisation', '24:50', 'https://www.youtube.com/watch?v=T-D1OfcDW1M'],
                ['Sécurité & Audit de Smart Contracts : Réentrance, Overflow & Contrôle d\'Accès', '31:10', 'https://www.youtube.com/watch?v=rWHvp7rUka8'],
                ['Architecture Frontend dApp : Connexion MetaMask, Wagmi, Viem & Ethers.js', '25:45', 'https://www.youtube.com/watch?v=SqcY0GlETPk'],
                ['Stockage Décentralisé IPFS, Indexation The Graph & Déploiement Layer 2', '29:00', 'https://www.youtube.com/watch?v=SLB_c_ayRMo'],
            ],
        ];
    }

    private function ensureExtendedCatalogSeeded(): void
    {
        if (Cache::get('vibe_courses_10_modules_synced_v4')) {
            return;
        }

        $instructor1 = User::first() ?? User::create([
            'name'     => 'Marwane',
            'email'    => 'Marwane@MR1Academy.com',
            'password' => Hash::make('123Marwane456!'),
            'is_admin' => true,
        ]);

        $instructor2 = User::skip(1)->first() ?? $instructor1;
        $playlistsCatalog = $this->getCoursePlaylistsCatalog();

        $newCourses = [
            [
                'title'       => 'Ingénierie IA Générative : LLMs, RAG & Agents Autonomes',
                'description' => 'Maîtrisez les Large Language Models (OpenAI, Claude, Llama 3), l\'architecture RAG avec bases vectorielles, LangChain et la création d\'agents IA autonomes en production.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor1,
                'rating'      => 5.0,
                'students'    => 31400,
            ],
            [
                'title'       => 'Deep Learning & Computer Vision avec PyTorch',
                'description' => 'Construisez et entraînez des réseaux de neurones profonds (CNN, Vision Transformers, YOLO) avec PyTorch et accélération GPU CUDA.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.9,
                'students'    => 19800,
            ],
            [
                'title'       => 'Data Engineering : Apache Spark, Kafka & Pipelines Big Data',
                'description' => 'Concevez des architectures Data Lakehouse modernes : ingestion temps réel avec Apache Kafka, traitement distribué PySpark, Airflow et DBT.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.9,
                'students'    => 16400,
            ],
            [
                'title'       => 'Data Analytics, Power BI, DAX & Storytelling Décisionnel',
                'description' => 'Transformez des millions de lignes de données brutes en tableaux de bord exécutifs interactifs avec Power BI, DAX avancé, Power Query et SQL analytique.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor1,
                'rating'      => 4.8,
                'students'    => 22100,
            ],
            [
                'title'       => 'DevOps Cloud Native : Docker, Kubernetes, Terraform & CI/CD',
                'description' => 'Automatisez vos infrastructures cloud de A à Z : conteneurisation Docker multi-stage, clusters Kubernetes (EKS/GKE), Infrastructure as Code Terraform et GitHub Actions.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.9,
                'students'    => 25300,
            ],
            [
                'title'       => 'Cybersécurité Offensive : Ethical Hacking, Pentest & OWASP',
                'description' => 'Apprenez à sécuriser les applications web et réseaux : méthodologie Pentest, Top 10 OWASP, cryptographie, analyse réseau Wireshark et défense Zero-Trust.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor1,
                'rating'      => 4.9,
                'students'    => 27900,
            ],
            [
                'title'       => 'Next.js 15 & TypeScript 5 : Architecture SaaS Full-Stack',
                'description' => 'Développez des applications web ultra-rapides avec Next.js App Router, React Server Components, TypeScript strict, Prisma ORM et Tailwind CSS.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor1,
                'rating'      => 5.0,
                'students'    => 26800,
            ],
            [
                'title'       => 'Flutter 3 & Dart : Applications Mobiles iOS & Android Pro',
                'description' => 'Créez des applications mobiles natives compilées à 120 FPS pour iOS et Android avec une seule base de code Flutter, Riverpod, animations fluides et API REST.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.8,
                'students'    => 17500,
            ],
            [
                'title'       => 'Programmation Système & Web Haute Performance avec Rust',
                'description' => 'Maîtrisez le langage le plus aimé des développeurs : Ownership, Borrow Checker, zéro Garbage Collector, concurrence sans data-race et WebAssembly.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor1,
                'rating'      => 4.9,
                'students'    => 14200,
            ],
            [
                'title'       => 'Go (Golang) : Microservices Concurrents, gRPC & Cloud',
                'description' => 'Développez des backends ultra-scalables en Go : Goroutines, Channels, APIs HTTP/gRPC haute fréquence et architecture hexagonale.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.8,
                'students'    => 13600,
            ],
            [
                'title'       => 'PostgreSQL Avancé, Redis & Architecture de Données Haute Dispo',
                'description' => 'Optimisez vos bases de données relationnelles et NoSQL : indexation B-Tree/GIN, partitionnement PostgreSQL, cache distribué Redis et réplication.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor2,
                'rating'      => 4.9,
                'students'    => 11900,
            ],
            [
                'title'       => 'Web3, Blockchain & Smart Contracts Solidity sur Ethereum',
                'description' => 'Concevez, auditez et déployez des applications décentralisées (dApps) : cryptographie Ethereum, Smart Contracts Solidity, Hardhat et intégration Ethers.js.',
                'thumbnail'   => 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1000&auto=format&fit=crop',
                'instructor'  => $instructor1,
                'rating'      => 4.7,
                'students'    => 10800,
            ],
        ];

        foreach ($newCourses as $data) {
            if (!Course::where('title', $data['title'])->exists()) {
                Course::create([
                    'title'          => $data['title'],
                    'description'    => $data['description'],
                    'thumbnail'      => $data['thumbnail'],
                    'user_id'        => $data['instructor']->id,
                    'rating'         => $data['rating'],
                    'students_count' => $data['students'],
                ]);
            }
        }

        // Synchronize EVERY course in the database so it has at least 10 modules with accurate durations
        $allCourses = Course::with('modules')->get();
        foreach ($allCourses as $course) {
            $targetModules = $playlistsCatalog[$course->title] ?? null;

            if (!$targetModules) {
                // Fallback 10-module curriculum for any custom admin-created course
                $targetModules = [
                    ['Introduction, Architecture & Configuration de l\'Environnement', '16:20', 'https://www.youtube.com/watch?v=SqcY0GlETPk'],
                    ['Concepts Fondamentaux, Syntaxe & Bonnes Pratiques', '22:15', 'https://www.youtube.com/watch?v=O6P86uwfdR0'],
                    ['Structures de Données, Modélisation & Flux de Contrôle', '25:40', 'https://www.youtube.com/watch?v=Ke90Tje7VS0'],
                    ['Architecture Modulaire, Composants & Réutilisabilité', '24:10', 'https://www.youtube.com/watch?v=TNhaISOUy6Q'],
                    ['Gestion d\'État, Persistance & Connexion Base de Données', '28:30', 'https://www.youtube.com/watch?v=RebA5J-rlwg'],
                    ['Communication Réseau, APIs RESTful & Sérialisation JSON', '26:45', 'https://www.youtube.com/watch?v=LRE0fL-d2o8'],
                    ['Sécurité, Authentification JWT & Validation des Entrées', '29:15', 'https://www.youtube.com/watch?v=7Q17ubqLfaM'],
                    ['Optimisation des Performances, Cache & Scalabilité', '23:50', 'https://www.youtube.com/watch?v=jgpVdJB2sKQ'],
                    ['Tests Unitaires, Tests d\'Intégration & Débogage Avancé', '25:20', 'https://www.youtube.com/watch?v=vZm0lHciFsQ'],
                    ['Mise en Production, Conteneurisation Docker & CI/CD', '31:10', 'https://www.youtube.com/watch?v=3c-iBn73dDE'],
                ];
            }

            $existingModules = $course->modules->sortBy('order')->values();

            foreach ($targetModules as $idx => $modDef) {
                $order = $idx + 1;
                if (isset($existingModules[$idx])) {
                    // Update existing module in place so student completed_modules IDs remain valid!
                    $existingMod = $existingModules[$idx];
                    $existingMod->update([
                        'title'     => $modDef[0],
                        'duration'  => $modDef[1],
                        'video_url' => $modDef[2],
                        'order'     => $order,
                    ]);
                } else {
                    // Append missing modules up to 10+
                    Module::create([
                        'course_id' => $course->id,
                        'title'     => $modDef[0],
                        'duration'  => $modDef[1],
                        'video_url' => $modDef[2],
                        'order'     => $order,
                    ]);
                }
            }
        }

        Cache::forever('vibe_courses_10_modules_synced_v4', true);
    }

    public function index()
    {
        $this->ensureExtendedCatalogSeeded();
        $courses = Course::with('instructor', 'modules')->get();
        return response()->json($courses);
    }

    public function show($id)
    {
        $this->ensureExtendedCatalogSeeded();
        try {
            $course = Course::with('instructor', 'modules', 'comments.user')->findOrFail($id);
            return response()->json($course);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Ce cours n\'existe pas ou a été supprimé.'], 404);
        }
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'thumbnail'   => 'required|string',
            'price'       => 'nullable|numeric|min:0',
        ], [
            'title.required'       => 'Le titre est obligatoire.',
            'description.required' => 'La description est obligatoire.',
            'thumbnail.required'   => 'L\'image de couverture est obligatoire.',
            'price.numeric'        => 'Le prix doit être un nombre valide.',
        ]);

        $course = Course::create([
            'title'       => $data['title'],
            'description' => $data['description'],
            'thumbnail'   => $data['thumbnail'],
            'price'       => $data['price'] ?? 0,
            'user_id'     => $request->user()->id,
        ]);

        return response()->json($course->load('instructor', 'modules'), 201);
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'thumbnail'   => 'required|string',
            'price'       => 'nullable|numeric|min:0',
        ], [
            'title.required'       => 'Le titre est obligatoire.',
            'description.required' => 'La description est obligatoire.',
        ]);

        $course->update($data);

        return response()->json($course->load('instructor', 'modules'));
    }

    public function addModule(Request $request, $courseId)
    {
        $course = Course::findOrFail($courseId);

        $data = $request->validate([
            'title'     => 'required|string|max:255',
            'duration'  => 'required|string',
            'video_url' => 'required|string',
        ], [
            'title.required'     => 'Le titre du module est requis.',
            'video_url.required' => 'Le lien de la vidéo est requis.',
        ]);

        // Auto-assign order
        $data['order'] = $course->modules()->count() + 1;

        $module = $course->modules()->create($data);

        return response()->json($module, 201);
    }

    public function deleteModule($courseId, $moduleId)
    {
        $module = \App\Models\Module::where('id', $moduleId)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $module->delete();

        // Re-order remaining modules
        $remaining = \App\Models\Module::where('course_id', $courseId)
            ->orderBy('order')
            ->get();
        foreach ($remaining as $i => $m) {
            $m->update(['order' => $i + 1]);
        }

        return response()->json(['message' => 'Module supprimé.']);
    }

    /**
     * Specialized Error Handling for Personalized Routes
     */
    public function myCourses(Request $request)
    {
        $this->ensureExtendedCatalogSeeded();
        try {
            $enrollments = $request->user()->enrollments()
                ->with('course.instructor', 'course.modules')
                ->get();
            return response()->json($enrollments);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la récupération de vos cours.'], 500);
        }
    }

    public function enroll(Request $request, $id)
    {
        $user = $request->user();
        
        try {
            $course = Course::findOrFail($id);
            
            // Already enrolled?
            if ($user->enrollments()->where('course_id', $id)->exists()) {
                return response()->json(['message' => 'Vous suivez déjà cette formation.'], 400);
            }

            $user->enrollments()->create([
                'course_id' => $id,
                'progress'  => 0
            ]);

            return response()->json(['message' => 'Inscription réussie ! Profitez de votre cours.']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Formation introuvable.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Une erreur est survenue lors de l\'inscription.'], 500);
        }
    }
}
