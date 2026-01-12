import React, { useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import "../../pagescss/questions.css";

export default function FaqsSection({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs.length) {
    return (
      <div id="faqs" className="section-block">
        <h2>FAQs</h2>
        <div className="underline gold3" />
        <p>No FAQs available at the moment.</p>
      </div>
    );
  }

  return (
    <div id="faqs" className="section-block">
      <h2>FAQs</h2>
      <div className="underline gold3" />
      {faqs.map((faq, index) => (
        <div key={index} className="faq-item">
          <button
            className="faq-question"
            onClick={() => toggleFAQ(index)}
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
            id={`faq-question-${index}`}
            type="button"
          >
            <span>{faq.question}</span>
            <RiArrowDropDownLine
              className={`dropdown-icon ${openIndex === index ? "rotated" : ""}`}
              size={28}
              aria-hidden="true"
            />
          </button>
          <div
            id={`faq-answer-${index}`}
            role="region"
            aria-labelledby={`faq-question-${index}`}
            className={`faq-answer ${openIndex === index ? "expanded" : "collapsed"}`}
          >
            {faq.answer}
          </div>
        </div>
      ))}
    </div>
  );
}
