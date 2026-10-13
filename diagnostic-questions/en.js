// English translation of fr.js. Hand-maintained; scripts/sync-diagnostic-content.py checks it still matches.
window.JUNIOR_DIAGNOSTIC_CONTENT = {
  "strategique": {
    "key": "diagnostic-strategique-v2",
    "title": "Strategic Diagnostic",
    "scoreMax": 250,
    "maturityLevels": [
      {
        "min": 0,
        "max": 39,
        "label": "Critical misalignment",
        "description": "Vision, priorities and execution are fragmented. Decisions rest on individuals, not on a structured strategic framework."
      },
      {
        "min": 40,
        "max": 59,
        "label": "Developing alignment",
        "description": "Some strategic elements exist but aren't integrated. Leaders may express different visions depending on the context."
      },
      {
        "min": 60,
        "max": 74,
        "label": "Partial alignment",
        "description": "The organization has good strategic intentions and clear indicators, but gaps remain between strategy, execution and team alignment."
      },
      {
        "min": 75,
        "max": 89,
        "label": "Strong alignment",
        "description": "Strategic direction and performance management are well structured. A few targeted improvements would reach excellence."
      },
      {
        "min": 90,
        "max": 100,
        "label": "World-class alignment",
        "description": "The organization fully integrates vision, measurement and execution. Governance and communication are perfectly in sync."
      }
    ],
    "dimensions": [
      {
        "id": "D1",
        "title": "Strategic direction",
        "subtitle": "Vision · Positioning · Strategic objectives",
        "description": "This dimension assesses whether your organization has set a clear, ambitious and shared course, and whether that course actively guides decisions.",
        "questions": [
          {
            "id": "Q1",
            "title": "Purpose",
            "text": "To what extent is the current wording of your purpose centred on a meaningful transformation of your market, your customers or society?",
            "rationale": "An organization whose leaders focus on internal goals rather than external transformation risks stagnation and losing relevance as customer expectations evolve quickly."
          },
          {
            "id": "Q2",
            "title": "Positioning and value proposition",
            "text": "How would you rate the clarity of your value proposition, to the point that your leaders all articulate it the same way and your customers immediately recognize it as different from your competitors?",
            "rationale": "If every leader \"sells\" the organization differently, the positioning isn't anchored. This is foundational work before any growth or expansion effort."
          },
          {
            "id": "Q3",
            "title": "Business model",
            "text": "How far is your business model documented and understood by your leadership team, so that everyone knows how you create, deliver and capture value?",
            "rationale": "An undocumented business model creates blind spots in strategic decisions. You can't optimize what you haven't formalized."
          },
          {
            "id": "Q4",
            "title": "Strategic analysis",
            "text": "To what degree does your organization have a clear, shared reading of its strengths, weaknesses, opportunities and threats that actively influences your strategic decisions?",
            "rationale": "A strategic analysis that isn't shared and regularly updated is an academic exercise. We want to know whether strategic analysis is alive or dormant in the organization."
          },
          {
            "id": "Q5",
            "title": "Strategy by perspective",
            "text": "How consistently is your strategy translated into each of your organization's main perspectives (financial, customer, internal processes, people and learning)?",
            "rationale": "A strategy that isn't cascaded by perspective remains an intention. This question reveals whether leadership can translate the vision into concrete priorities for each function."
          },
          {
            "id": "Q6",
            "title": "Objectives and their causal logic",
            "text": "How clear is the logic between your strategic objectives: defined by perspective, with documented cause-and-effect links, so that everyone understands why reaching objective A leads to objective B?",
            "rationale": "Objectives without causal links produce siloed efforts. When a team doesn't understand how its objective contributes to others', alignment is impossible."
          }
        ]
      },
      {
        "id": "D2",
        "title": "Targets & measurement",
        "subtitle": "KPIs · Performance indicators · Quantified trajectory",
        "description": "This dimension assesses whether your organization translates its strategy into measurable objectives, concrete indicators and a trajectory over time.",
        "questions": [
          {
            "id": "Q7",
            "title": "Quality of indicators",
            "text": "To what extent do your performance indicators include outcome indicators (what was achieved), leading indicators (what signals results to come) and quality guardrails (what must not be sacrificed while chasing results)?",
            "rationale": "Organizations that only measure past results discover problems too late to react. Leading indicators and guardrails make it possible to step in before results deteriorate."
          },
          {
            "id": "Q8",
            "title": "SMART rigour of objectives",
            "text": "How precisely are your strategic objectives worded (a numeric target, a defined time horizon, a named owner), so that you can assess unambiguously whether they were reached?",
            "rationale": "A vague objective is a wish. A SMART objective is a commitment. The distinction radically changes the accountability dynamic within the team."
          },
          {
            "id": "Q9",
            "title": "Alignment of indicators with strategy",
            "text": "What proportion of your strategic objectives is measured by at least one directly related key performance indicator?",
            "rationale": "An objective without an indicator is a statement of intent. Alignment between objectives and indicators is what turns strategy into a performance management system."
          },
          {
            "id": "Q10",
            "title": "Consistency of the trajectory over time",
            "text": "To what degree has your organization documented a consistent trajectory between its current state and its long-term objectives, with intermediate milestones that add up arithmetically (short-term results logically sum up to the long-term vision)?",
            "rationale": "Many organizations have an ambitious vision and an annual plan, but the gap between the two isn't structured. That trajectory consistency is what separates a credible plan from a planning exercise."
          },
          {
            "id": "Q11",
            "title": "North Star and shared direction",
            "text": "How well established is your organization's main metric or indicator (a North Star): one that crystallizes the essence of your ambition and that every member of the leadership team can quote spontaneously?",
            "rationale": "When everyone steers toward the same star, day-to-day decisions align naturally. Without a shared North Star, each department optimizes for its own metrics at the expense of overall coherence."
          }
        ]
      },
      {
        "id": "D3",
        "title": "Alignment & execution",
        "subtitle": "OKRs · Team plans · Management cadences",
        "description": "This dimension assesses whether your strategy actually reaches every level of the organization, with management cadences that turn intentions into results.",
        "questions": [
          {
            "id": "Q12",
            "title": "OKRs or quarterly equivalents",
            "text": "How would you rate your organization's use of structured quarterly commitments (inspiring qualitative objectives and measurable numeric key results) to translate the annual strategy into short-term execution priorities?",
            "rationale": "Without a quarterly mechanism, the annual strategy stays abstract and day-to-day urgency takes over. OKRs create the cadence that holds the course between strategic reviews."
          },
          {
            "id": "Q13",
            "title": "Team alignment with strategy",
            "text": "How clearly can every department or team explain how its priorities for the quarter contribute to the organization's strategic objectives (an alignment that is documented and checked regularly)?",
            "rationale": "Declared alignment and real alignment are often different. Without structured checks, teams optimize for their own local priorities rather than collective objectives."
          },
          {
            "id": "Q14",
            "title": "Clear performance expectations",
            "text": "To what extent are performance expectations for each key role documented, known to the people in those roles, and actively used in development and evaluation conversations?",
            "rationale": "Fuzzy expectations lead to subjective evaluations, frustration and weak retention. Clear expectations are one of the most important drivers of engagement and performance."
          },
          {
            "id": "Q15",
            "title": "Dashboards and performance visibility",
            "text": "To what degree do your leaders have a dashboard that gives them a clear, near-real-time view of the organization's strategic health (objective status, key indicators, warning signals), so they can make informed decisions quickly?",
            "rationale": "A well-designed executive dashboard shortens the time to detect problems and speeds up corrective decisions. Without shared visibility, teams navigate by gut feel."
          },
          {
            "id": "Q16",
            "title": "Management cadence (structured meetings)",
            "text": "With what discipline does your organization hold structured management cadences at every level (weekly team review, monthly management review, quarterly strategic review), where decisions are made from data, not opinions?",
            "rationale": "Management cadence is the circulatory system of strategy. Without it, problems pile up, decisions lag and teams fall out of sync. Cadence discipline is what makes continuous improvement possible."
          }
        ]
      },
      {
        "id": "D4",
        "title": "Maturity & capabilities",
        "subtitle": "Organizational maturity · Execution capacity · Operational excellence",
        "description": "This dimension assesses whether your organization has the real maturity to execute the strategy it has set: not just the intention, but the capacity.",
        "questions": [
          {
            "id": "Q17",
            "title": "Process maturity",
            "text": "How rigorously are your key operational processes documented, standardized and followed?",
            "rationale": "Undocumented processes create dependence on individuals. When a key person leaves, the know-how leaves with them. Process standardization is the foundation of scalability."
          },
          {
            "id": "Q18",
            "title": "Data and decision-making maturity",
            "text": "What share of your important decisions is made from reliable, structured data?",
            "rationale": "Data-driven organizations make better decisions faster. Data maturity isn't a technology question. It's a matter of discipline and culture."
          },
          {
            "id": "Q19",
            "title": "Technology infrastructure maturity",
            "text": "How far does your technology infrastructure (tools, systems, platforms) actively support your strategic objectives?",
            "rationale": "Technology must serve the strategy, not the other way around. Unsuitable infrastructure slows execution, creates data silos and limits the ability to scale."
          },
          {
            "id": "Q20",
            "title": "Capacity for change",
            "text": "How would you rate your organization's ability to implement major changes successfully, all the way to their objectives?",
            "rationale": "Capacity for change is an organizational asset. Transformation mandates rarely fail for lack of good ideas. They fail for lack of organizational capacity to bring them to life."
          }
        ]
      },
      {
        "id": "D5",
        "title": "Prioritization & sequencing",
        "subtitle": "Strategic prioritization · Roadmap · Resource allocation",
        "description": "This dimension assesses whether your organization invests its time and capital in the right places, at the right time, with a defensible prioritization logic and a roadmap aligned with its vision.",
        "questions": [
          {
            "id": "Q21",
            "title": "Vision clarity as a prioritization anchor",
            "text": "To what extent is your short-, medium- and long-term vision clear and shared enough to serve as a prioritization criterion, for example to decide objectively between two projects?",
            "rationale": "Without a clear vision as an anchor, prioritization decisions become political: you pick the projects of the most influential people, not the most strategic ones."
          },
          {
            "id": "Q22",
            "title": "Knowledge of the competitive landscape",
            "text": "How well do you know your positioning against your competitors: their strengths, their weaknesses and the strategic spaces where you have a real or potential advantage?",
            "rationale": "An organization that doesn't know its competitive landscape well often invests in initiatives that don't create a differentiated advantage."
          },
          {
            "id": "Q23",
            "title": "Voice of the customer in decisions",
            "text": "How far are your organization's priorities shaped by structured listening to your customers: what they like, what they need, what they're missing, what they would avoid if possible?",
            "rationale": "Organizations that prioritize without structured customer listening end up building what they think is good rather than what the market really wants."
          },
          {
            "id": "Q24",
            "title": "Cost-benefit analysis of initiatives",
            "text": "To what degree are your decisions to invest in new initiatives based on a rigorous analysis of the effort required, the expected impact, the reach and the confidence level in the assumptions?",
            "rationale": "Intuition is a starting point, not a prioritization mechanism. Objectively comparing very different initiatives on a common basis is what makes the roadmap defensible."
          },
          {
            "id": "Q25",
            "title": "Available capacity and expertise",
            "text": "How would you rate how realistically your organization accounts for its current capacity (people, available expertise, team bandwidth) before committing to new strategic initiatives?",
            "rationale": "Overestimating organizational capacity is one of the most frequent causes of initiative failure. This question forces an honest assessment of what the organization can really carry without sacrificing ongoing execution."
          }
        ]
      }
    ]
  },
  "commercialisation": {
    "key": "diagnostic-commercialisation-v3",
    "title": "Go-to-Market Diagnostic",
    "scoreMax": 300,
    "maturityLevels": [
      {
        "min": 0,
        "max": 39,
        "label": "No infrastructure",
        "description": "The organization sells mainly on instinct and personal relationships. No documented commercial structure. Growth depends entirely on individuals."
      },
      {
        "min": 40,
        "max": 59,
        "label": "Foundations under construction",
        "description": "Some commercial elements exist (rough ICP, defined offer) but aren't integrated into a coherent system. Results are unpredictable."
      },
      {
        "min": 60,
        "max": 74,
        "label": "Partial system",
        "description": "The organization has a commercial strategy and a few tools, but execution is uneven. Growth exists but remains hard to predict and scale."
      },
      {
        "min": 75,
        "max": 89,
        "label": "Operational system",
        "description": "The commercial approach is structured, measured and regularly improved. Growth is predictable. A few optimizations would speed things up."
      },
      {
        "min": 90,
        "max": 100,
        "label": "Commercial engine",
        "description": "The organization has a complete, aligned and high-performing commercial system. It turns its customers into growth assets and scales with discipline."
      }
    ],
    "dimensions": [
      {
        "id": "D1",
        "title": "Commercial foundations",
        "subtitle": "ICP · Value proposition · Competitive positioning",
        "description": "This dimension assesses whether the foundations of your commercial system are in place: who you sell to, why choose you, and how you stand apart.",
        "questions": [
          {
            "id": "Q1",
            "title": "Clarity of the ideal customer profile (ICP)",
            "text": "How precisely has your organization defined and documented its ideal customer profile: industry, size, decision-maker's role, buying triggers, and the red flags that show a prospect is not a good fit?",
            "rationale": "A fuzzy ICP forces sales teams to pitch everyone and convince no one. It's the first source of long sales cycles and low conversion rates."
          },
          {
            "id": "Q2",
            "title": "Differentiated value proposition",
            "text": "How would you rate your value proposition: worded in terms of concrete outcomes for the customer, and distinctive enough that your customers immediately understand why you and not a competitor?",
            "rationale": "A generic value proposition forces you to compete on price. Clarity and differentiation are the two levers that justify higher value and shorten the sales cycle."
          },
          {
            "id": "Q3",
            "title": "Knowledge of the competitive landscape",
            "text": "To what extent does your team have a clear, recent reading of your direct and indirect competitors (their strengths, weaknesses and positioning) that actively influences your commercial decisions?",
            "rationale": "Ignoring the competitive landscape exposes you to being overtaken without seeing it coming. Competitive knowledge is a direct tactical advantage in every sales conversation."
          },
          {
            "id": "Q4",
            "title": "Consistency of the sales message",
            "text": "To what degree do all members of your sales team articulate the same message (same problem addressed, same differentiation, same value proposition)?",
            "rationale": "An inconsistent sales message confuses prospects and dilutes the organization's credibility. Message alignment is an often-underestimated multiplier of commercial performance."
          }
        ]
      },
      {
        "id": "D2",
        "title": "Customer journey knowledge",
        "subtitle": "Customer journey · Friction points · Differentiation by stage",
        "description": "This dimension assesses whether you understand how your customers buy, step by step, and whether you adapt your approach to each moment of their journey.",
        "questions": [
          {
            "id": "Q5",
            "title": "Customer journey mapping",
            "text": "How far has your organization documented its customers' journey, step by step (from awareness to purchase and beyond), to guide its sales and marketing decisions?",
            "rationale": "Without a journey map, commercial effort is applied at the wrong stages. Knowing where the customer stands radically changes the message to deliver and the channel to use."
          },
          {
            "id": "Q6",
            "title": "Identified friction points",
            "text": "To what extent do you know where your prospects drop off in the buying process (at which stage opportunities are most often lost, and why), and act concretely to reduce that friction?",
            "rationale": "Most lost revenue doesn't come from a bad product but from a poorly calibrated journey. Identifying and removing friction is one of the fastest levers for improving conversion rates."
          },
          {
            "id": "Q7",
            "title": "Differentiation strategy by stage",
            "text": "To what degree does your commercial approach adapt to the prospect's stage (awareness content for those discovering, comparison arguments for those evaluating, social proof for those hesitating)?",
            "rationale": "A message adapted to the journey stage converts significantly better. Differentiation isn't only expressed against competitors. It's also expressed according to where the customer is in their thinking."
          }
        ]
      },
      {
        "id": "D3",
        "title": "Business model and go-to-market",
        "subtitle": "Pricing · GTM strategy · Acquisition channels",
        "description": "This dimension assesses whether your pricing, channel and go-to-market choices are structured, documented and economically viable.",
        "questions": [
          {
            "id": "Q8",
            "title": "Pricing logic",
            "text": "How much weight do the perceived value and the outcomes you create for your customers carry in setting your prices?",
            "rationale": "Value-based pricing is the most direct lever on profitability. An organization that prices on its costs systematically leaves money on the table and positions itself as a commodity rather than a strategic partner."
          },
          {
            "id": "Q9",
            "title": "Documented GTM strategy",
            "text": "How far is your go-to-market strategy documented (priority channels, messages by segment, activation sequence, measurable objectives)?",
            "rationale": "An undocumented GTM strategy is fragile: it depends on individuals, not the system. Documenting it makes it possible to test, improve and scale it without starting over with every team change."
          },
          {
            "id": "Q10",
            "title": "Prioritization of acquisition channels",
            "text": "With what discipline do you concentrate your resources (time, budget, attention) on 1 or 2 clearly identified main acquisition channels?",
            "rationale": "Trying to be everywhere at once is the most common and least effective commercial strategy. Focusing on the channels that work best for your specific ICP is what creates predictable growth."
          },
          {
            "id": "Q11",
            "title": "Sales motion (activation sequence)",
            "text": "To what degree does your team follow a structured, repeatable sales sequence, from first interaction to signature?",
            "rationale": "A repeatable sales motion is the difference between a sales team and a sales system. Revenue predictability depends directly on discipline in executing the sequence."
          }
        ]
      },
      {
        "id": "D4",
        "title": "Sales pipeline",
        "subtitle": "Sales cycle structure · Conversion rates · Predictability",
        "description": "This dimension assesses whether your sales cycle is structured, measurable and predictable, or whether it relies mainly on sellers' intuition.",
        "questions": [
          {
            "id": "Q12",
            "title": "Sales pipeline structure",
            "text": "To what extent is your sales pipeline structured, with clearly defined stages, explicit progression criteria between each step and a conversion probability attached to each stage?",
            "rationale": "A pipeline without structure can't be managed. Without explicit progression criteria, deals move forward on optimism rather than concrete buyer signals, which makes forecasting impossible."
          },
          {
            "id": "Q13",
            "title": "Measuring conversion rates by stage",
            "text": "How rigorously do you measure your conversion rates at every stage of the sales cycle, from first contact to signature, to identify where opportunities are lost and how to fix it?",
            "rationale": "Stage conversion rates are the diagnostic system of your commercial engine. An abnormally low rate at a specific stage points to a specific, treatable problem: a poorly defined ICP, a message that doesn't convince, or a proposal without a clear ROI."
          },
          {
            "id": "Q14",
            "title": "Forecast reliability and revenue predictability",
            "text": "How far do your revenue forecasts rest on structured pipeline data (weighted probabilities, validated stages, conversion history)?",
            "rationale": "A reliable forecast changes the nature of commercial decisions: you can invest with confidence, hire at the right time and avoid cash crunches. Without a forecast, the organization flies blind and makes reactive rather than proactive decisions."
          }
        ]
      },
      {
        "id": "D5",
        "title": "Execution and management",
        "subtitle": "Management dashboard · Metrics · Field learnings",
        "description": "This dimension assesses whether your commercial execution is visible, measured and learning, or whether it happens in the dark with little usable data.",
        "questions": [
          {
            "id": "Q15",
            "title": "Tracking commercial metrics",
            "text": "How regularly does your organization measure its key commercial metrics (leads generated, conversion rates, sales cycle length, acquisition cost, deal value)?",
            "rationale": "What you don't measure, you can't improve. Organizations that manage with data make better decisions faster and avoid perpetuating approaches that don't work."
          },
          {
            "id": "Q16",
            "title": "Field learning discipline",
            "text": "How far does your team document what works and what doesn't in your commercial actions, to steer the decisions of the following week or month?",
            "rationale": "Most teams repeat the same mistakes because they have no mechanism to capture and use their learnings. A field learning log is what turns experience into a lasting competitive advantage."
          },
          {
            "id": "Q17",
            "title": "Unit economics",
            "text": "To what degree do you know your unit economics precisely (average deal value, customer acquisition cost, customer lifetime value or LTV) and use them to guide your marketing and sales investment decisions?",
            "rationale": "Without knowing its unit economics, an organization can't decide how much to invest to acquire a customer, nor assess whether its commercial efforts are profitable. It's the foundation of any rational commercial decision."
          },
          {
            "id": "Q18",
            "title": "Commercial review cadence",
            "text": "How would you rate your commercial review cadence: regular and structured (weekly for actions, monthly for metrics, quarterly for assumptions), with decisions made from data, not opinions?",
            "rationale": "A commercial review without cadence becomes a status meeting with no impact. Cadence creates the obligation to decide, and data-based decisions create continuous improvement."
          }
        ]
      },
      {
        "id": "D6",
        "title": "Customer-led growth",
        "subtitle": "Opportunity assessment · Onboarding · Retention · Partnership",
        "description": "This dimension assesses whether your organization turns its customers into growth assets: by delivering well, retaining them and mobilizing them as a source of new revenue.",
        "questions": [
          {
            "id": "Q19",
            "title": "Opportunity qualification",
            "text": "How consistently does your team apply a structured qualification grid to assess each sales opportunity (ICP fit, real and urgent problem, available budget, identified decision-maker)?",
            "rationale": "Chasing the wrong opportunities is one of the main sources of wasted commercial resources. A disciplined qualification grid protects the team's time and focuses energy on the deals most likely to close."
          },
          {
            "id": "Q20",
            "title": "Quality of the onboarding experience",
            "text": "To what extent is your customer onboarding process documented, consistent and designed to create value quickly, shortening the time between signature and the first concrete result the customer perceives?",
            "rationale": "Onboarding is when customers unconsciously decide whether they'll become an advocate or a detractor. Structured onboarding reduces churn, speeds up referrals and increases customer lifetime value."
          },
          {
            "id": "Q21",
            "title": "Turning customers into a source of growth",
            "text": "How far do your current customers actively contribute to your growth (through referrals, testimonials, renewals or expanded mandates)?",
            "rationale": "The easiest customer to sell to is the one who already trusted you. Organizations that systematize customer-led growth reduce their dependence on constantly acquiring new prospects."
          }
        ]
      },
      {
        "id": "D7",
        "title": "Competitive intelligence",
        "subtitle": "Digital presence · Marketing tactics · Technology stack",
        "description": "This dimension assesses how actively your organization knows its competitors' marketing and sales tactics, beyond simply knowing their positioning and offer.",
        "questions": [
          {
            "id": "Q22",
            "title": "Competitors' digital presence and content",
            "text": "How up to date is your view of your competitors' digital presence (their organic search ranking, social media presence, content frequency and engagement)?",
            "rationale": "A competitor's active digital presence is often the best indicator of its growth intentions and of the markets it is actively targeting. Ignoring this dimension creates strategic blind spots."
          },
          {
            "id": "Q23",
            "title": "Competitors' paid acquisition tactics",
            "text": "How well do you know the paid ads (Google Ads, LinkedIn, Meta) your competitors are currently running (messages, formats, targeted audiences)?",
            "rationale": "A competitor's paid ads reveal its market priorities and current selling arguments. This information is public and accessible. Not knowing it means flying blind on what is actively influencing your prospects."
          },
          {
            "id": "Q24",
            "title": "Competitors' nurturing sequences",
            "text": "To what extent have you tested your competitors' nurturing sequences yourselves (by signing up to their lists, downloading their content or requesting a demo) to understand how they cultivate their prospects?",
            "rationale": "Email sequences are one of the richest signals of a competitor's marketing sophistication. Knowing what they tell your shared prospects, and in what order, is a direct tactical advantage in sales."
          },
          {
            "id": "Q25",
            "title": "Competitors' event and institutional presence",
            "text": "How would you rate your knowledge of your competitors' presence at events, associations and conferences, and of the role they play there (exhibitor, speaker, sponsor), especially in the markets you target?",
            "rationale": "A competitor's event presence signals where it invests to build credibility and relationships. In some industries, institutional presence matters as much as product quality."
          },
          {
            "id": "Q26",
            "title": "Competitors' technology stack",
            "text": "How thoroughly do you know the tools (CRM, marketing automation, analytics) your main competitors use to run their sales and marketing system, and what that reveals about their level of sophistication and their investments?",
            "rationale": "A competitor's technology stack reveals its maturity. These choices signal the segments they serve, the resources they invest and the processes they've automated. It's public, easily accessible information."
          },
          {
            "id": "Q27",
            "title": "Competitors' relative price positioning",
            "text": "How precisely do you track your competitors' price positioning (premium, parity or discount) to factor it into your pricing strategy and sales arguments?",
            "rationale": "Ignoring the competition's price positioning exposes you to surprises late in the sales cycle. Knowing where you stand relatively lets you adapt your pitch and prepare your teams for objections."
          }
        ]
      },
      {
        "id": "D8",
        "title": "Capture, scoring & activation",
        "subtitle": "Intent signals · Qualification · Activation sequences",
        "description": "This dimension assesses whether your organization has set up a system to detect commercial signals, qualify its prospects in a structured way and trigger deterministic activation actions.",
        "questions": [
          {
            "id": "Q28",
            "title": "The two demand engines",
            "text": "How clearly does your organization distinguish, in its resource allocation, between actions that create demand (content, awareness, brand presence) and actions that capture existing demand (signals, scoring, activation)?",
            "rationale": "At any given time, roughly 5% of your targets are in market. The other 95% will be one day. An organization that only invests in capture wears itself out fishing in a limited pond. Creating demand builds a future pipeline with every piece of content and every public appearance."
          },
          {
            "id": "Q29",
            "title": "Structured prospect scoring and qualification",
            "text": "To what extent does your organization use a structured system to qualify and prioritize its prospects, based on company profile (fit) and observable behavioural signals (intent)?",
            "rationale": "A scoring system turns qualification from an individual art into an organizational process. Without it, organizations spend as much time on a poorly qualified prospect as on an ideal account."
          },
          {
            "id": "Q30",
            "title": "Routing rules and activation sequences",
            "text": "To what degree are your rules for moving from signal to action documented: which commercial action to trigger based on a prospect's score and signal (who reaches out, through which channel, within what time frame)?",
            "rationale": "The speed and precision of the response to a commercial signal is often what separates a won deal from a missed opportunity. A deterministic routing rule turns intent into a systematic competitive advantage."
          }
        ]
      }
    ]
  }
};
