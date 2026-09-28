import { BenchmarkQuery, Citation, Technology } from '../types';

export interface CorpusEntry {
  id: string;
  keywords: string[];
  tech: 'FastAPI' | 'React';
  title: string;
  section: string;
  url: string;
  summary: string;
  detailedAnswer: string;
  codeSnippet: {
    code: string;
    language: string;
    filename: string;
    versionBadge: string;
  };
  citations: Citation[];
}

export const CORPUS_DATA: CorpusEntry[] = [
  {
    id: 'fastapi-depends',
    keywords: ['depends', 'dependency', 'injection', 'sub-dependencies', 'yield', 'use_cache', 'fastapi'],
    tech: 'FastAPI',
    title: 'Dependencies - Fundamentals',
    section: 'Declaration, Hierarchical Graph & Scoping',
    url: 'https://fastapi.tiangolo.com/tutorial/dependencies/',
    summary: 'FastAPI features a high-performance dependency injection system based on `Depends()`. It enables reusability, security validation, and database connection pooling.',
    detailedAnswer: 'In FastAPI, dependency injection is structured around the `Depends` callable utility. It acts as an extensible abstraction for database connections, contextual security, and parameter aggregation without repetitive wiring.\n\nDependencies are resolved topologically. By default, values are cached per-request so that if multiple dependencies request the same sub-dependency, it is computed only once unless disabled with `use_cache=False`.',
    codeSnippet: {
      language: 'python',
      filename: 'src/main.py',
      versionBadge: 'FASTAPI 0.115',
      code: `from fastapi import Depends, FastAPI
from typing import Annotated

app = FastAPI()

async def common_parameters(q: str | None = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

CommonsDep = Annotated[dict, Depends(common_parameters)]

@app.get("/items/")
async def read_items(commons: CommonsDep):
    return commons`
    },
    citations: [
      {
        index: 1,
        title: 'Dependencies - Fundamentals',
        section: 'Declaration and execution graph',
        tech: 'FastAPI',
        url: 'https://fastapi.tiangolo.com/tutorial/dependencies/',
        summary: 'Official guide on injecting callable dependencies, function parameters, and sharing database sessions.'
      },
      {
        index: 2,
        title: 'Hierarchical Sub-dependencies',
        section: 'Parameter scope & caching behaviour',
        tech: 'FastAPI',
        url: 'https://fastapi.tiangolo.com/tutorial/dependencies/sub-dependencies/',
        summary: 'Deep tree resolution and request-scoped caching using use_cache=True/False flags.'
      }
    ]
  },
  {
    id: 'fastapi-middleware',
    keywords: ['middleware', 'asgi', 'http', 'call_next', 'cors', 'headers', 'intercept'],
    tech: 'FastAPI',
    title: 'Advanced Middleware & ASGI Handlers',
    section: 'HTTP Middleware and CallNext pipeline',
    url: 'https://fastapi.tiangolo.com/tutorial/middleware/',
    summary: 'FastAPI middleware runs with every request before processing by any specific path operation and before returning any response.',
    detailedAnswer: 'In FastAPI, you declare HTTP middleware using either the decorator `@app.middleware("http")` or by registering ASGI middleware classes with `app.add_middleware()`. The `call_next` function passes the incoming `Request` to the path operation and returns the resulting `Response`, allowing header injection, timing metrics, and authentication verification.',
    codeSnippet: {
      language: 'python',
      filename: 'src/middleware.py',
      versionBadge: 'FASTAPI ASGI',
      code: `import time
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response`
    },
    citations: [
      {
        index: 1,
        title: 'Advanced Middleware',
        section: 'HTTP Middleware and CallNext pipeline',
        tech: 'FastAPI',
        url: 'https://fastapi.tiangolo.com/tutorial/middleware/',
        summary: 'Middleware mechanics, request mutation, and response interceptor lifecycle.'
      },
      {
        index: 2,
        title: 'CORS & Security Middleware',
        section: 'Starlette ASGI Layer wrappers',
        tech: 'FastAPI',
        url: 'https://fastapi.tiangolo.com/tutorial/cors/',
        summary: 'Configuring CORSMiddleware origins, allowed methods, and credential passing.'
      }
    ]
  },
  {
    id: 'fastapi-jwt-oauth2',
    keywords: ['oauth2', 'jwt', 'token', 'auth', 'security', 'bearer', 'password', 'oauth2passwordbearer'],
    tech: 'FastAPI',
    title: 'Security with OAuth2 & JWT',
    section: 'OAuth2 with Password (and hashing), Bearer with JWT tokens',
    url: 'https://fastapi.tiangolo.com/tutorial/security/first-steps/',
    summary: 'OAuth2PasswordBearer creates a security scheme that looks for an `Authorization: Bearer <token>` header in incoming requests, combined with cryptographic token decoding.',
    detailedAnswer: 'FastAPI provides security utilities built on OpenAPI standards. `OAuth2PasswordBearer` defines a schema requiring an `Authorization: Bearer <token>` header. You pair this with PyJWT to decode cryptographic JSON Web Tokens, verifying expiration (`exp`) and claims before injecting the validated user identity into route endpoints.',
    codeSnippet: {
      language: 'python',
      filename: 'src/security.py',
      versionBadge: 'FASTAPI SECURITY',
      code: `from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return {"username": username}
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")`
    },
    citations: [
      {
        index: 1,
        title: 'Security - First Steps',
        section: 'OAuth2 with Password (and hashing), Bearer with JWT tokens',
        tech: 'FastAPI',
        url: 'https://fastapi.tiangolo.com/tutorial/security/first-steps/',
        summary: 'Step-by-step token authentication with FastAPI security primitives.'
      },
      {
        index: 2,
        title: 'OAuth2 with Password and Bearer',
        section: 'Cryptographic validation & token decoding',
        tech: 'FastAPI',
        url: 'https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/',
        summary: 'Production token generation, hashing algorithms, and scopes verification.'
      }
    ]
  },
  {
    id: 'react-useeffect',
    keywords: ['useeffect', 'effect', 'dependency', 'dependencies', 'synchronize', 'cleanup', 'react'],
    tech: 'React',
    title: 'Synchronizing with Effects & Dependency Control',
    section: 'Specifying Reactive Dependencies and Cleanup Semantics',
    url: 'https://react.dev/learn/synchronizing-with-effects',
    summary: 'The useEffect dependency array tells React when to run side-effect code by comparing reactive values against their previous render values with Object.is.',
    detailedAnswer: 'In React, the `useEffect` dependency array specifies every reactive value referenced inside the effect closure (props, state, and variables calculated inside the component body). React executes the effect after the component paints and re-executes it only when at least one specified dependency changes by shallow `Object.is` comparison.\n\nReturning a cleanup function ensures connections, timers, or subscriptions are gracefully aborted before the effect re-runs or unmounts.',
    codeSnippet: {
      language: 'jsx',
      filename: 'src/ChatRoom.jsx',
      versionBadge: 'REACT 19',
      code: `import { useEffect } from 'react';

export function ChatRoom({ roomId, serverUrl }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();

    return () => {
      connection.disconnect(); // Cleanup on unmount or before roomId changes
    };
  }, [roomId, serverUrl]); // Only re-synchronize when roomId or serverUrl change

  return <h1>Welcome to {roomId}</h1>;
}`
    },
    citations: [
      {
        index: 1,
        title: 'Synchronizing with Effects',
        section: 'Specifying Reactive Dependencies',
        tech: 'React',
        url: 'https://react.dev/learn/synchronizing-with-effects',
        summary: 'Understanding reactive values, omitting dependencies vs including them, and avoiding infinite render loops.'
      },
      {
        index: 2,
        title: 'useEffect API Reference',
        section: 'Dependencies array and cleanup semantics',
        tech: 'React',
        url: 'https://react.dev/reference/react/useEffect',
        summary: 'Complete technical reference for useEffect lifecycle hooks, strict mode double-invocations, and server-side caveats.'
      }
    ]
  },
  {
    id: 'react-usestate',
    keywords: ['usestate', 'state', 'updater', 'batching', 'snapshot', 'rerender', 'react'],
    tech: 'React',
    title: 'State: A Component’s Memory',
    section: 'Updating State with Functional Arguments and Automatic Batching',
    url: 'https://react.dev/learn/state-a-components-memory',
    summary: 'The useState hook stores local component state. Functional updater arguments ensure sequential state updates are calculated accurately against queued pending states.',
    detailedAnswer: 'In React, state behaves like a snapshot across each render. Calling `setState(newValue)` queues another render. When deriving the next state from the current state (like incrementing or toggling), always pass an updater function `setState(prev => prev + 1)` rather than passing raw state. This guarantees safe batched execution even when multiple updates occur inside the same event loop tick.',
    codeSnippet: {
      language: 'jsx',
      filename: 'src/Counter.jsx',
      versionBadge: 'REACT 19',
      code: `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  function handleTripleIncrement() {
    // Correct updater pattern for batched calculations:
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
  }

  return <button onClick={handleTripleIncrement}>Count: {count}</button>;
}`
    },
    citations: [
      {
        index: 1,
        title: 'State: A Component’s Memory',
        section: 'Updating state with functional arguments',
        tech: 'React',
        url: 'https://react.dev/learn/state-a-components-memory',
        summary: 'Declaring state variables, isolate render cycles, and maintaining immutable state trees.'
      },
      {
        index: 2,
        title: 'useState API Reference',
        section: 'Set state updater function and render cycle',
        tech: 'React',
        url: 'https://react.dev/reference/react/useState',
        summary: 'Initial state functions, avoiding recreating initial objects, and batching guarantees in React 19.'
      }
    ]
  },
  {
    id: 'react-custom-hooks',
    keywords: ['custom hook', 'hooks', 'reuse', 'composition', 'encapsulation', 'react'],
    tech: 'React',
    title: 'Reusing Logic with Custom Hooks',
    section: 'Extracting and Composing Stateful Logic Without Coupling',
    url: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
    summary: 'A custom Hook is a JavaScript function whose name starts with "use" that may call other Hooks to share stateful mechanisms across components.',
    detailedAnswer: 'Custom Hooks allow you to extract component logic into reusable functions. Unlike copying and pasting component code, custom Hooks share stateful logic (like subscribing to browser network status, geolocation, or animation timers), not state itself. Each component calling the hook maintains isolated state variables while adhering to the standard Rules of Hooks.',
    codeSnippet: {
      language: 'jsx',
      filename: 'src/useOnlineStatus.js',
      versionBadge: 'REACT PATTERNS',
      code: `import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}`
    },
    citations: [
      {
        index: 1,
        title: 'Reusing Logic with Custom Hooks',
        section: 'Extracting and composing reactive state',
        tech: 'React',
        url: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
        summary: 'Structuring custom hooks, naming conventions, and returning tuple or object records.'
      }
    ]
  },
  {
    id: 'react-19-actions',
    keywords: ['action', 'useactionstate', 'useformstatus', 'react 19', 'server action', 'optimistic'],
    tech: 'React',
    title: 'React 19 Actions & useActionState',
    section: 'Asynchronous Form Actions and Pending Transitions',
    url: 'https://react.dev/reference/react/useActionState',
    summary: 'React 19 introduces native Actions support with `useActionState` to handle async form submissions, pending indicators, and optimistic updates.',
    detailedAnswer: 'In React 19, `useActionState` manages async transitions for form actions. It accepts an action function and initial state, returning `[state, formAction, isPending]`. Paired with `useFormStatus`, child inputs can read the submission status without prop drilling. This replaces boilerplate useState/useEffect error handling with automatic error boundaries and transition isolation.',
    codeSnippet: {
      language: 'jsx',
      filename: 'src/UpdateNameForm.jsx',
      versionBadge: 'REACT 19',
      code: `import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

async function updateNameAction(previousState, formData) {
  const name = formData.get("name");
  const res = await apiUpdateName(name);
  return res.success ? { name } : { error: res.error };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>;
}

export function UpdateNameForm() {
  const [state, formAction, isPending] = useActionState(updateNameAction, { name: '' });

  return (
    <form action={formAction}>
      <input name="name" defaultValue={state.name} />
      <SubmitButton />
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}`
    },
    citations: [
      {
        index: 1,
        title: 'useActionState API Reference',
        section: 'Action functions, error states, and pending indicators',
        tech: 'React',
        url: 'https://react.dev/reference/react/useActionState',
        summary: 'React 19 native action orchestration and automatic pending transition state.'
      },
      {
        index: 2,
        title: 'useFormStatus API Reference',
        section: 'Reading parent form status in child component tree',
        tech: 'React',
        url: 'https://react.dev/reference/react-dom/hooks/useFormStatus',
        summary: 'Hook for accessing pending form submit lifecycle without manual callback propagation.'
      }
    ]
  },
  {
    id: 'fastapi-pydantic-validation',
    keywords: ['pydantic', 'validation', 'schema', 'body', 'query', 'path', 'fastapi'],
    tech: 'FastAPI',
    title: 'Request Body & Pydantic Validation',
    section: 'Type Annotations and Automatic JSON Serialization',
    url: 'https://fastapi.tiangolo.com/tutorial/body/',
    summary: 'FastAPI leverages Pydantic v2 models to declare request bodies, automatically parsing JSON, verifying data types, and rendering OpenAPI schemas.',
    detailedAnswer: 'When declaring request data in FastAPI, you inherit from Pydantic `BaseModel`. FastAPI inspects the type annotations, parses request JSON, converts types (e.g. ISO strings to datetime objects), and automatically returns rich RFC 7807 error responses with status code 422 if client payload validation fails.',
    codeSnippet: {
      language: 'python',
      filename: 'src/models.py',
      versionBadge: 'FASTAPI 0.115',
      code: `from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class Item(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None
    price: float = Field(gt=0, description="Price must be strictly positive")
    tax: float | None = 0.0

@app.post("/items/")
async def create_item(item: Item):
    return {"total": item.price + (item.tax or 0), "item": item}`
    },
    citations: [
      {
        index: 1,
        title: 'Request Body - Pydantic Models',
        section: 'Schema declaration and field validation',
        tech: 'FastAPI',
        url: 'https://fastapi.tiangolo.com/tutorial/body/',
        summary: 'Official tutorial on declaring strict JSON payloads with Pydantic.'
      }
    ]
  }
];

export function retrieveCorpus(query: string, techFilter: Technology = 'all'): CorpusEntry | null {
  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/[\s,?.!]+/).filter(Boolean);

  let bestEntry: CorpusEntry | null = null;
  let highestScore = -1;

  for (const entry of CORPUS_DATA) {
    if (techFilter !== 'all') {
      if (techFilter === 'fastapi' && entry.tech !== 'FastAPI') continue;
      if (techFilter === 'react' && entry.tech !== 'React') continue;
    }

    let score = 0;

    // Check exact keyword matches
    for (const kw of entry.keywords) {
      if (cleanQuery.includes(kw)) {
        score += 8;
      }
      for (const tok of queryTokens) {
        if (kw === tok) score += 5;
        else if (kw.includes(tok) && tok.length > 2) score += 2;
      }
    }

    // Check title & summary tokens
    const textCorpus = (entry.title + ' ' + entry.section + ' ' + entry.summary).toLowerCase();
    for (const tok of queryTokens) {
      if (textCorpus.includes(tok)) score += 3;
    }

    if (score > highestScore) {
      highestScore = score;
      bestEntry = entry;
    }
  }

  // Fallback to top entry if nothing scored high enough, matching tech filter if possible
  if (highestScore <= 0) {
    if (techFilter === 'fastapi') {
      return CORPUS_DATA.find(e => e.tech === 'FastAPI') || CORPUS_DATA[0];
    } else if (techFilter === 'react') {
      return CORPUS_DATA.find(e => e.tech === 'React') || CORPUS_DATA[3];
    }
    return CORPUS_DATA[0];
  }

  return bestEntry;
}

export const BENCHMARK_QUERIES: BenchmarkQuery[] = [
  {
    id: 'bm-1',
    ref: 'REF.01',
    prompt: 'How do I use Depends in FastAPI?',
    tag: 'FastAPI',
    description: 'Dependency injection & singleton resolution graph',
    tech: 'fastapi'
  },
  {
    id: 'bm-2',
    ref: 'REF.02',
    prompt: 'How do I add HTTP middleware in FastAPI?',
    tag: 'FastAPI',
    description: 'ASGI middleware wrappers & request interceptors',
    tech: 'fastapi'
  },
  {
    id: 'bm-3',
    ref: 'REF.03',
    prompt: 'What does the useEffect dependency array control?',
    tag: 'React',
    description: 'Reactive synchronization & lifecycle diffing',
    tech: 'react'
  },
  {
    id: 'bm-4',
    ref: 'REF.04',
    prompt: 'How do I update state with useState in React?',
    tag: 'React',
    description: 'Updater functions & batched rerenders',
    tech: 'react'
  },
  {
    id: 'bm-5',
    ref: 'REF.05',
    prompt: 'How does OAuth2PasswordBearer work with JWT in FastAPI?',
    tag: 'FastAPI',
    description: 'Security schemes, bearer header parsing & verification',
    tech: 'fastapi'
  },
  {
    id: 'bm-6',
    ref: 'REF.06',
    prompt: 'How do I create a custom Hook in React?',
    tag: 'React',
    description: 'Hook composition, state encapsulation & purity',
    tech: 'react'
  }
];
