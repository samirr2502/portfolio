import { FaGithub } from "react-icons/fa";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useState } from 'react';

function FeaturedProject({ project }) {

    const [imageIndices, setImageIndices] = useState({});

    const getImageUrl = (imagePath) => {
        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        return `${import.meta.env.BASE_URL}${cleanPath}`;
    };

    const nextImage = (projectName, imagesLength) => {
        setImageIndices(prev => ({
            ...prev,
            [projectName]: ((prev[projectName] || 0) + 1) % imagesLength
        }));
    };

    const prevImage = (projectName, imagesLength) => {
        setImageIndices(prev => ({
            ...prev,
            [projectName]: ((prev[projectName] || 0) - 1 + imagesLength) % imagesLength
        }));
    };
    const currentIndex = imageIndices[project.name] || 0;
    return (
        <div className="featuredProject" key={project.name}>
            <div className="featuredContent">

                <span className="featuredEyebrow">{project.category}</span>
                <h2>{project.name}</h2>
                <p className="featuredDescription">
                    {project.description || "A standout project with polished interactions, mobile-first design, and a beautiful app preview."}
                </p>

                <div className="featuredMeta">
                    <span>{project.year}</span>
                    {project.class && <span>{project.class}</span>}
                    {project.tags && <span>{project.tags.join(' · ')}</span>}
                </div>

                <div className="featuredButtons">
                    {project.githubRep && (
                        <a href={project.githubRep} target="_blank" rel="noreferrer">View Code</a>
                    )}
                    {project.webLink && (
                        <a href={project.webLink} target="_blank" rel="noreferrer">Open App</a>
                    )}
                </div>
            </div>

            <div className="featuredMedia">
                {project.images && project.images.length > 0 ? (
                    <div className="carousel">
                        <img src={getImageUrl(project.images[currentIndex])} alt={`${project.name} preview`} />
                        {project.images.length > 1 && (
                            <>
                                <button className="carousel-btn prev" onClick={() => prevImage(project.name, project.images.length)}>&lt;</button>
                                <button className="carousel-btn next" onClick={() => nextImage(project.name, project.images.length)}>&gt;</button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="featuredImageFallback">App preview coming soon</div>
                )}
            </div>
        </div>
    );

}

export default FeaturedProject
