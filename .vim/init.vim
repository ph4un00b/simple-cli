call plug#begin(stdpath('data') . '/plugged')

Plug 'mhartington/oceanic-next'
Plug 'neoclide/coc.nvim', {'branch': 'release'}
"Plug 'junegunn/fzf.vim', { 'do': { -> fzf#install() } }
Plug 'tpope/vim-sensible'
Plug 'mattn/emmet-vim'

call plug#end()

set termguicolors
colorscheme OceanicNext

" https://github.com/neovim/neovim/wiki/FAQ#how-to-use-the-windows-clipboard-from-wsl
" to make Neovim use the system's (i.e Window's) clipboard by default.
set clipboard=unnamedplus

source .vim/coc.vim
set number
" avoid CLRF EOL from dos/windows
set ff=unix
" avoid looking at node_modules/
" whenever we fuzzy search, for instance:
" :tabe **/index...
set path+=**
set wildignore+=**/node_modules/** 
