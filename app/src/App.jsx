import { useRoute, match } from "./lib/router.jsx";
import Header from "./components/Header.jsx";
import DemoBanner from "./components/DemoBanner.jsx";
import Toaster from "./components/Toaster.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import AuthPage from "./components/AuthPage.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import NewPost from "./pages/NewPost.jsx";
import EditPost from "./pages/EditPost.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import NotFound from "./pages/NotFound.jsx";

function Page({ route }) {
	const { path, query } = route;
	if (path === "/") return <Home />;
	if (path === "/entrar") return <AuthPage next={query.get("next")}><Login next={query.get("next")} /></AuthPage>;
	if (path === "/cadastro") return <AuthPage next={query.get("next")}><Signup next={query.get("next")} /></AuthPage>;
	if (path === "/nova")
		return (
			<RequireAuth returnTo={route.full}>
				<NewPost />
			</RequireAuth>
		);
	if (path === "/minhas")
		return (
			<RequireAuth returnTo={route.full}>
				<MyPosts />
			</RequireAuth>
		);
	let p;
	if ((p = match("/publicacao/:id/editar", path)))
		return (
			<RequireAuth returnTo={route.full}>
				<EditPost id={p.id} />
			</RequireAuth>
		);
	if ((p = match("/publicacao/:id", path))) return <PostDetail id={p.id} />;
	return <NotFound />;
}

export default function App() {
	const route = useRoute();
	return (
		<>
			<a
				className="skip-link"
				href="#conteudo"
				onClick={(e) => {
					e.preventDefault();
					document.getElementById("conteudo")?.focus();
				}}>
				Pular para o conteúdo
			</a>
			<DemoBanner />
			<Header path={route.path} returnTo={route.full} />
			<main id="conteudo" tabIndex={-1}>
				<Page key={route.full} route={route} />
			</main>
			<footer className="site-footer">
				CampusFind · Achados E Perdidos Univille ©️
			</footer>
			<Toaster />
		</>
	);
}
