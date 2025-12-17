import React, { useState, useEffect } from 'react';
import { Share2, Link as LinkIcon, ExternalLink, Zap, GitBranch, Twitter, Github, Linkedin, Instagram, Mail, CheckCircle, XCircle, Star, MessageSquare } from 'lucide-react';

// FIX: Changed Firebase imports from CDN URLs to standard package names 
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, addDoc, collection, setLogLevel, query, onSnapshot } from 'firebase/firestore';

// Setting Firebase log level for debugging
setLogLevel('Debug');

// --- Global Context Variables (Provided by Canvas Environment) ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Sample data structure for the articles (Ecosystem Pulse)
const articleData = [
  // --- EXISTING ARTICLES ---
  {
    title: "Kalshi $2M Grant Program with Base and Solana to Build On-Chain Prediction Products",
    article: "https://paragraph.com/@basedarticles/kalshi-launches-dollar2m-grant-program-with-base-and-solana-to-build-on-chain-prediction-products",
    image: "https://img.paragraph.com/cdn-cgi/image/format=auto,width=1080,quality=85/https://storage.googleapis.com/papyrus_images/f2d92a3ca274d12abc01f3366c677c62239ef00a1065915134c3e923354bd507.jpg"
  },
  {
    title: "Base released a new BaseLayer episode featuring ShaneMac of xmtp",
    article: "https://paragraph.com/@basedarticles/base-released-a-new-baselayer-episode-featuring-shanemac-of-xmtp",
    image: "https://img.paragraph.com/cdn-cgi/image/format=auto,width=1080,quality=85/https://storage.googleapis.com/papyrus_images/ac471ffc14657c733289c02fa6e5a84648f18095ee9075cc7eff3bf6de548519.jpg"
  },
  {
    title: "American Express Steps Onchain",
    article: "https://paragraph.com/@basedarticles/american-express-steps-onchain",
    image: "https://img.paragraph.com/cdn-cgi/image/format=auto,width=1080,quality=85/https://storage.googleapis.com/papyrus_images/6e5600464b8cc361f6f0edb00265d3519212a558214c59599a2e748c17d5967b.jpg"
  },
  {
    title: "Base Launches a Global Ecosystem Job Network for Builders",
    article: "https://paragraph.com/@basedarticles/base-launches-a-global-ecosystem-job-network-for-builders",
    image: "https://pbs.twimg.com/profile_images/1945608199500910592/rnk6ixxH_400x400.jpg"
  },
  {
    title: "Introducing WARP, A New Era for Cross-Chain Token Bridging Between Solana and Base",
    article: "https://paragraph.com/@basedarticles/introducing-warp-a-new-era-for-cross-chain-token-bridging-between-solana-and-base",
    image: "https://img.paragraph.com/cdn-cgi/image/format=auto,width=1080,quality=85/https://storage.googleapis.com/papyrus_images/97da7ecf98124b0252cb7be565eb184454f535328c3fa53ca8d44ab6c32cfe264.jpg"
  },
  {
    title: "Cypher Unlocks Everyday Onchain Spending on Base",
    article: "https://paragraph.com/@basedarticles/cypher-unlocks-everyday-onchain-spending-on-base",
    image: "https://img.paragraph.com/cdn-cgi/image/format=auto,width=1080,quality=85/https://storage.googleapis.com/papyrus_images/303202c3bd07af16ccd65a2af5c6195c83f7d98efcdfe8aa2f8709729ce41fde.jpg"
  },
  {
    title: "The District Flywheel: How a $1M Builder Fund Puts Builders Back in Control",
    article: "https://paragraph.com/@basedarticles/the-district-flywheel-how-a-dollar1m-builder-fund-puts-builders-back-in-control",
    image: "https://img.paragraph.com/cdn-cgi/image/format=auto,width=1080,quality=85/https://storage.googleapis.com/papyrus_images/c346f7702bc5d7794b19221426fc8bbb8569f40646619ae3032ee5faa5a56b5.jpg"
  },
  {
    title: "Jacob Horne, Co-Founder of Zora and Architect of the Creator Economy",
    article: "https://paragraph.com/@basedarticles/jacob-horne-co-founder-of-zora-and-architect-of-the-creator-economy",
    image: "https://img.paragraph.com/cdn-cgi/image/format=auto,width=1080,quality=85/https://storage.googleapis.com/papyrus_images/1303c146b94b3f46b621406467e761e453fc01fa21e5cec34e1aa7fbd04ba966.jpg"
  }
];

// Sample data structure for projects (Builder Projects) - NOW LIMITED TO THREE
const projectData = [
  {
    name: "Nedapay",
    description: "A leading East African crypto-fintech finalist from Base Batches 2, focused on enabling digital payments and financial access.",
    status: "Live Beta",
    tags: ["Fintech", "Payments", "Africa", "Base Batches"],
    appLink: "https://paragraph.com/@basedarticles/nedapays-journey-to-becoming-east-africas-top-12-finalist-at-base-batches-2", 
    githubLink: "#"
  },
  {
    name: "ExpendiApp",
    description: "An onchain budgeting and expense tracking tool designed for the decentralized financial world, helping users manage their crypto assets.",
    status: "Live Beta",
    tags: ["DeFi", "Budgeting", "Tools"],
    appLink: "https://paragraph.com/@basedarticles/why-expendi-is-the-budgeting-tool-we-need-now",
    githubLink: "#"
  },
  {
    name: "Minisend",
    description: "Infrastructure layer focused on making onchain earnings instantly and truly spendable, bridging crypto income to real-world utility.",
    status: "In Development",
    tags: ["Infrastructure", "Payments", "Utility"],
    // New image link for context (ProjectCard doesn't display it yet, but data is ready)
    image: "https://img.paragraph.com/cdn-cgi/image/format=auto,width=1080,quality=85/https://storage.googleapis.com/papyrus_images/5f411c5a4552804c8f52b4cd57205e002e9f5a665e752d79170dbc5c5b582f47.jpg",
    appLink: "https://paragraph.com/@basedarticles/minisend-the-infrastructure-layer-making-onchain-earnings-truly-spendable",
    githubLink: "#"
  },
  // Removed other projects for the initial list
];

// Sample data structure for events (NOW EMPTY)
const eventData = [];

// Social media data - UPDATED with user-provided links
const socialLinks = [
    { name: 'X', icon: Twitter, url: 'https://x.com/based_articles' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/company/110306073/admin/dashboard/' },
    { name: 'Paragraph', icon: ExternalLink, url: 'https://paragraph.com/@basedarticles/' },
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/based_articles?igsh=MWdlY3Uxa3dmMzJndQ%3D%3D&utm_source=qr' },
    { name: 'GitHub', icon: Github, url: 'https://github.com/base-org' }, 
];

// Helper function to handle sharing (simulated in this environment)
const handleShare = (title) => {
  console.log(`Sharing functionality is simulated. Article: "${title}"`);
};

/**
 * Article Card Component
 */
const ArticleCard = ({ article }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    // Fallback for clipboard access in environments like iframes
    const tempInput = document.createElement('input');
    tempInput.value = article.article;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy link:", err);
    }
    document.body.removeChild(tempInput);
  };

  return (
    <div className="flex flex-col overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out border border-gray-100">
      {/* Article Image */}
      <a href={article.article} target="_blank" rel="noopener noreferrer" className="block relative h-48 sm:h-56 overflow-hidden">
        <img
          className="w-full h-full object-cover transition duration-500 ease-in-out group-hover:scale-105"
          src={article.image}
          alt={article.title}
          onError={(e) => {
            // Placeholder fallback image if the URL fails
            e.target.onerror = null;
            e.target.src = `https://placehold.co/600x400/3B82F6/ffffff?text=Image+Loading+Failed`;
            e.target.alt = "Image not available";
          }}
        />
        <div className="absolute inset-0 bg-black opacity-10 transition-opacity hover:opacity-0"></div>
      </a>

      {/* Content Area */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-gray-900 leading-snug hover:text-blue-600 transition duration-150">
            <a href={article.article} target="_blank" rel="noopener noreferrer" className="line-clamp-3">
              {article.title}
            </a>
          </h2>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Read Article Button */}
          <a
            href={article.article}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition duration-150"
          >
            Read Article
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleShare(article.title)}
              className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition duration-150"
              aria-label="Share article"
              title="Share Article"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleCopyLink}
              className={`p-2 rounded-full transition duration-150 ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-blue-100 hover:text-blue-600'
              }`}
              aria-label={copied ? "Link copied" : "Copy link"}
              title={copied ? "Link Copied!" : "Copy Link"}
            >
              {copied ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Tag Component for Projects
 */
const Tag = ({ children }) => (
  <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-600">
    {children}
  </span>
);

/**
 * Project Card Component
 */
const ProjectCard = ({ project }) => {
  // Logic to determine color based on status
  const statusColors = {
    'In Development': 'bg-yellow-100 text-yellow-800',
    'Live Beta': 'bg-green-100 text-green-800',
    'Auditing': 'bg-blue-100 text-blue-800',
    'Proof of Concept': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-gray-200 text-gray-700',
  };
  const statusColor = statusColors[project.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="flex flex-col overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition duration-300">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-gray-900 leading-snug">{project.name}</h3>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColor}`}>
          {project.status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4 flex-grow">{project.description}</p>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4 pt-3 border-t border-gray-100">
        {project.tags.map((tag, i) => (
          <Tag key={i}>{tag}</Tag>
        ))}
      </div>

      {/* Actions */}
      <div className="flex space-x-3 mt-auto pt-2">
        <a
          href={project.appLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition duration-150 disabled:opacity-50"
        >
          <Zap className="h-4 w-4 mr-2" /> Live App
        </a>
        <a
          href={project.githubLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
        >
          <GitBranch className="h-4 w-4 mr-2" /> GitHub
        </a>
      </div>
    </div>
  );
};

/**
 * Event Card Component
 */
const EventCard = ({ event }) => {
    const isXSpace = event.platform.includes("X Space");
    const icon = isXSpace ? <Twitter className="h-5 w-5 mr-3 text-blue-500" /> : <ExternalLink className="h-5 w-5 mr-3 text-indigo-500" />;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col">
            <div className="flex items-center mb-3">
                {icon}
                <span className="text-sm font-semibold text-gray-600">{event.platform}</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow">{event.description}</p>
            
            <div className="border-t border-gray-100 pt-3 space-y-1">
                <p className="text-sm font-medium text-gray-700 flex items-center">
                    <Zap className="inline h-4 w-4 mr-1 text-yellow-500" />
                    {event.date} at {event.time}
                </p>
                <a 
                    href={event.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition duration-150"
                >
                    {isXSpace ? 'Join X Space' : 'View Event Details'}
                    <ExternalLink className="ml-1 h-4 w-4" />
                </a>
            </div>
        </div>
    );
};

/**
 * Review Card Component
 */
const ReviewCard = ({ review }) => {
    // Generate star icons based on the rating
    const stars = Array(5).fill(0).map((_, i) => (
        <Star
            key={i}
            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
    ));

    const reviewerName = review.name && review.name.trim() !== '' ? review.name : 'Anonymous User';
    const formattedDate = review.timestamp ? new Date(review.timestamp.seconds * 1000).toLocaleDateString() : 'N/A';

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between">
            <div>
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-2">
                    {stars}
                </div>
                {/* Review Text */}
                <p className="text-gray-700 text-base italic mb-4">
                    "{review.reviewText}"
                </p>
            </div>
            {/* Reviewer Info */}
            <div className="border-t border-gray-100 pt-3 text-sm text-gray-500">
                <p className="font-semibold text-gray-800">{reviewerName}</p>
                <p className="text-xs mt-0.5">Reviewed on {formattedDate}</p>
            </div>
        </div>
    );
};


/**
 * Reviews Page Component
 */
const ReviewsPage = ({ db, userId, isAuthReady }) => {
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState('');
    const [reviewName, setReviewName] = useState('');
    const [rating, setRating] = useState(5);
    const [status, setStatus] = useState({ message: '', type: null }); // type: 'success' | 'error' | null
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Fetch Reviews in Realtime
    useEffect(() => {
        if (!isAuthReady || !db) return;

        const reviewsCollectionRef = collection(db, `artifacts/${appId}/public/data/reviews`);
        // Use a simple query without ordering to comply with optional constraints, 
        // sorting will be done in memory by timestamp if available.
        const q = query(reviewsCollectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReviews = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Sort reviews locally by timestamp (newest first)
            fetchedReviews.sort((a, b) => {
                const timeA = a.timestamp?.seconds || 0;
                const timeB = b.timestamp?.seconds || 0;
                return timeB - timeA;
            });
            
            setReviews(fetchedReviews);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching reviews:", error);
            setIsLoading(false);
        });

        setIsLoading(true);
        return () => unsubscribe();
    }, [db, isAuthReady]); // Re-run when DB is ready

    // 2. Handle Review Submission
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setStatus({ message: '', type: null });
        
        if (reviewText.trim().length < 10) {
            setStatus({ message: 'Review must be at least 10 characters long.', type: 'error' });
            return;
        }

        if (!db || !userId) {
            setStatus({ message: 'Database connection not ready. Please refresh or try again.', type: 'error' });
            return;
        }

        setIsSubmitting(true);

        try {
            const reviewsRef = collection(db, `artifacts/${appId}/public/data/reviews`);
            
            await addDoc(reviewsRef, {
                name: reviewName.trim() || 'Anonymous User',
                reviewText: reviewText.trim(),
                rating: rating,
                timestamp: new Date(),
                userId: userId,
            });

            setStatus({ message: 'Thank you for your review! It will appear shortly.', type: 'success' });
            setReviewText('');
            setReviewName('');
            setRating(5);

        } catch (error) {
            console.error("Error submitting review:", error);
            setStatus({ message: `Submission failed: ${error.message}.`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Determine alert style
    const alertStyle = status.type === 'success'
        ? 'bg-green-100 text-green-800 border-green-400'
        : status.type === 'error'
        ? 'bg-red-100 text-red-800 border-red-400'
        : 'hidden';
    
    const AlertIcon = status.type === 'success' ? CheckCircle : XCircle;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center border-b-2 border-purple-500 pb-2">
                <MessageSquare className="w-7 h-7 mr-2 text-purple-600"/> What Our Readers Say
            </h2>

            {/* Review Submission Form */}
            <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-xl border border-gray-100 mb-10">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Leave Your Review</h3>
                
                <div role="alert" className={`flex items-center p-3 mb-4 rounded-lg border ${status.type ? alertStyle : 'hidden'}`}>
                    <AlertIcon className="h-5 w-5 mr-3" />
                    <p className="text-sm font-medium">{status.message}</p>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                    {/* Rating Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
                        <div className="flex space-x-1">
                            {Array(5).fill(0).map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setRating(i + 1)}
                                    className="p-1 focus:outline-none"
                                    aria-label={`Rate ${i + 1} stars`}
                                >
                                    <Star 
                                        className={`h-6 w-6 transition-colors ${
                                            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name Input */}
                    <div>
                        <label htmlFor="reviewName" className="block text-sm font-medium text-gray-700">Name (Optional)</label>
                        <input
                            type="text"
                            id="reviewName"
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your name or handle"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Review Textarea */}
                    <div>
                        <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700">Your Feedback</label>
                        <textarea
                            id="reviewText"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows="4"
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Tell us what you think..."
                            required
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 disabled:bg-purple-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>


            {/* Display Reviews */}
            <h3 className="text-2xl font-bold text-gray-800 mb-6 mt-12">Latest Reviews</h3>
            
            {isLoading && (
                <div className="text-center p-6 text-gray-500">Loading reviews...</div>
            )}

            {!isLoading && reviews.length === 0 && (
                <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-100">
                    <MessageSquare className="h-10 w-10 mx-auto text-gray-400 mb-4" />
                    <p className="text-xl font-semibold text-gray-700 mb-2">Be the first to leave a review!</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>
        </div>
    );
};

/**
 * Subscribe Page Component
 */
const SubscribePage = ({ db, userId, isAuthReady }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ message: '', type: null }); // type: 'success' | 'error' | null
    const [isLoading, setIsLoading] = useState(false);

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setStatus({ message: '', type: null });
        if (!isValidEmail(email)) {
            setStatus({ message: 'Please enter a valid email address.', type: 'error' });
            return;
        }

        if (!db || !userId) {
            setStatus({ message: 'Database connection not ready. Please try again in a moment.', type: 'error' });
            return;
        }

        setIsLoading(true);

        try {
            // Save email to the public subscriptions collection
            const subscriptionRef = collection(db, `artifacts/${appId}/public/data/subscriptions`);
            
            await addDoc(subscriptionRef, {
                email: email,
                subscribedAt: new Date(),
                userId: userId, // Record the user who submitted (even if anonymous)
            });

            setStatus({ message: 'Subscription successful! Thanks for joining the community.', type: 'success' });
            setEmail('');

        } catch (error) {
            console.error("Error subscribing:", error);
            setStatus({ message: `Subscription failed: ${error.message}.`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Determine alert style
    const alertStyle = status.type === 'success'
        ? 'bg-green-100 text-green-800 border-green-400'
        : status.type === 'error'
        ? 'bg-red-100 text-red-800 border-red-400'
        : 'hidden';
    
    const AlertIcon = status.type === 'success' ? CheckCircle : XCircle;

    return (
        <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100 mt-8">
            <div className="text-center mb-6">
                <Mail className="w-12 h-12 mx-auto text-blue-600 mb-3" />
                <h2 className="text-3xl font-bold text-gray-900">Subscribe for Ecosystem Updates</h2>
                <p className="text-gray-500 mt-2">
                    Don't miss out on the latest articles, project launches, and builder events.
                </p>
            </div>
            
            {/* Status Alert */}
            <div role="alert" className={`flex items-center p-4 mb-6 rounded-lg border ${alertStyle}`}>
                <AlertIcon className="h-5 w-5 mr-3" />
                <p className="text-sm font-medium">{status.message}</p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <div className="mt-1 flex shadow-sm rounded-lg">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                            <Mail className="h-5 w-5" />
                        </span>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 block w-full rounded-none rounded-r-lg border border-gray-300 p-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="you@example.com"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Subscribing...
                        </>
                    ) : (
                        <>
                            Subscribe Now
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

// Component to render the list of articles
const ArticleList = ({ title }) => (
  <>
    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">
        {title}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articleData.map((article, index) => (
        <ArticleCard key={`article-${index}`} article={article} />
      ))}
    </div>
  </>
);

// Component to render the list of projects
const ProjectList = ({ title }) => (
  <>
    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-indigo-500 pb-2">
        {title}
    </h2 >
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {projectData.map((project, index) => (
        <ProjectCard key={`project-${index}`} project={project} />
      ))}
    </div>
  </>
);

// Component to render the list of events, handling the empty state
const EventList = ({ title }) => (
  <>
    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-yellow-500 pb-2">
        {title}
    </h2 >
    {eventData.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-100">
            <Zap className="h-10 w-10 mx-auto text-yellow-500 mb-4" />
            <p className="text-xl font-semibold text-gray-700 mb-2">No Upcoming Events Scheduled</p>
            <p className="text-gray-500">Check back soon or add new events to the `eventData` array in the code!</p>
        </div>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventData.map((event, index) => (
                <EventCard key={`event-${index}`} event={event} />
            ))}
        </div>
    )}
  </>
);

// Navigation Item Component
const NavItem = ({ view, activeView, setActiveView, children }) => (
  <button
    onClick={() => setActiveView(view)}
    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap ${
      activeView === view
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
    }`}
  >
    {children}
  </button>
);


/**
 * Main Application Component
 */
const App = () => {
  const [activeView, setActiveView] = useState('home');
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // 1. Initialize Firebase and Authentication
  useEffect(() => {
    // Check if Firebase is configured
    if (!firebaseConfig.apiKey) {
      console.error("Firebase config is missing. Firestore operations will fail.");
      setIsAuthReady(true); // Mark ready to unblock UI, knowing DB is disabled
      return;
    }

    try {
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const firebaseAuth = getAuth(app);
        
        setDb(firestore);
        setAuth(firebaseAuth);

        // Sign in logic
        const signIn = async (authInstance) => {
            if (initialAuthToken) {
                await signInWithCustomToken(authInstance, initialAuthToken);
            } else {
                await signInAnonymously(authInstance);
            }
        };

        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                // Set a unique fallback ID if authentication fails or is anonymous
                setUserId(crypto.randomUUID()); 
            }
            setIsAuthReady(true);
            console.log("Authentication state ready. User ID:", user?.uid || 'Anonymous/Fallback');
        });

        // Start the sign-in process
        signIn(firebaseAuth).catch(e => {
            console.error("Firebase sign-in failed:", e);
            // Set fallback userId if sign-in fails
            setUserId(crypto.randomUUID());
            setIsAuthReady(true);
        });

        return () => unsubscribe();

    } catch (e) {
        console.error("Firebase initialization failed:", e);
        setIsAuthReady(true);
    }
  }, []);

  const renderContent = () => {
    // Renders the appropriate content based on the active view state
    const commonProps = { db, userId, isAuthReady };

    switch (activeView) {
        case 'articles':
            return (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ArticleList title="Ecosystem Pulse (Latest Articles)" />
                </main>
            );
        case 'projects':
            return (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ProjectList title="Builder Projects (Current Initiatives)" />
                </main>
            );
        case 'events':
            return (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <EventList title="Upcoming Events & X-Spaces" />
                </main>
            );
        case 'reviews':
            return (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ReviewsPage {...commonProps} />
                </main>
            );
        case 'subscribe':
            return (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <SubscribePage {...commonProps} />
                </main>
            );
        case 'home':
        default:
            return (
                <>
                    {/* HOME INTRO BANNER */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white rounded-xl shadow-lg mt-8 mb-8 border-l-8 border-blue-600">
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                            Based Articles and News
                        </h2>
                        <p className="text-xl text-gray-700">
                            Get the latest Tech and Base ecosystem updates Builders, Developers, Creators, and Investors.
                        </p>
                        {/* Removed the App ID and User ID display block here */}
                    </div>
                    
                    {/* Projects Section on Home */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-6">
                        <ProjectList title="Builder Projects (Current Initiatives)" />
                    </section>
                </>
            );
    }
  };


  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      {/* Header with Navigation */}
      <header className="bg-white shadow-lg sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          
          <div className="flex justify-between items-center flex-wrap">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                <svg className="w-8 h-8 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Based Articles and News
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                A combined view of the latest news and emerging builder projects.
              </p>
            </div>
            
            {/* Navigation Buttons */}
            <nav className="flex space-x-2 mt-4 sm:mt-0 p-1 rounded-xl bg-gray-100">
              <NavItem view="home" activeView={activeView} setActiveView={setActiveView}>Home</NavItem>
              <NavItem view="articles" activeView={activeView} setActiveView={setActiveView}>Articles</NavItem>
              <NavItem view="projects" activeView={activeView} setActiveView={setActiveView}>Projects</NavItem>
              <NavItem view="events" activeView={activeView} setActiveView={setActiveView}>Events / X-Spaces</NavItem>
              <NavItem view="reviews" activeView={activeView} setActiveView={setActiveView}>Reviews</NavItem>
              <NavItem view="subscribe" activeView={activeView} setActiveView={setActiveView}>Subscribe</NavItem>
            </nav>
          </div>
        </div>
      </header>

      {/* Dynamic Content */}
      {renderContent()}

      {/* Footer - Social links added here */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center">
          
          {/* Social Links */}
          <div className="flex space-x-4 order-1 sm:order-2 mb-3 sm:mb-0">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition duration-150"
                aria-label={social.name}
                title={`Follow us on ${social.name}`}
              >
                <social.icon className="h-6 w-6" />
              </a>
            ))}
          </div>

          {/* Copyright Info */}
          <div className="text-center sm:text-left text-gray-500 text-sm order-2 sm:order-1">
            &copy; {new Date().getFullYear()} Decentralized News Feed. All articles linked externally.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
